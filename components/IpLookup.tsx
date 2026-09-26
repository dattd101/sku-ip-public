"use client";

import { useEffect, useState } from "react";

type DeviceInfo = { browser: string; os: string; resolution: string; userAgent: string };

const initial: DeviceInfo = { browser: "Loading...", os: "Loading...", resolution: "Loading...", userAgent: "Loading..." };

function browserName(ua: string) {
  if (/Edg\//.test(ua)) return "Microsoft Edge";
  if (/OPR\//.test(ua)) return "Opera";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return "Safari";
  return "Unknown";
}

function osName(ua: string) {
  if (/Windows NT/.test(ua)) return "Windows";
  if (/Android/.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/Mac OS X/.test(ua)) return "macOS";
  if (/Linux/.test(ua)) return "Linux";
  return "Unknown";
}

function Row({ icon, en, vi, value, mono = false }: { icon: React.ReactNode; en: string; vi: string; value: string; mono?: boolean }) {
  return (
    <div className="info-row">
      <div className="icon-box">{icon}</div>
      <div className="info-label"><strong>{en}</strong><span>{vi}</span></div>
      <div className={mono ? "info-value mono" : "info-value"}>{value}</div>
    </div>
  );
}

export default function IpLookup() {
  const [ip, setIp] = useState("Loading...");
  const [copied, setCopied] = useState(false);
  const [device, setDevice] = useState<DeviceInfo>(initial);
  const [now, setNow] = useState("");

  useEffect(() => {
    async function loadPublicIp() {
      try {
        // In production behind Cloudflare/Nginx/Vercel, our own API can read
        // the real client IP from trusted forwarding headers.
        const localResponse = await fetch("/api/ip", { cache: "no-store" });
        const localData = await localResponse.json();
        if (localData.ip && /^\d{1,3}(?:\.\d{1,3}){3}$/.test(localData.ip)) {
          setIp(localData.ip);
          return;
        }

        // During local development Next.js only sees a LAN/container address.
        // A browser-side request is required so the lookup service sees the
        // visitor's public Internet address rather than the Next.js server IP.
        const publicResponse = await fetch("https://api.ipify.org?format=json", { cache: "no-store" });
        if (!publicResponse.ok) throw new Error("Public IP lookup failed");
        const publicData = await publicResponse.json();
        setIp(publicData.ip || "Unavailable");
      } catch {
        setIp("Unavailable");
      }
    }

    loadPublicIp();
    const ua = navigator.userAgent;
    setDevice({ browser: browserName(ua), os: osName(ua), resolution: `${window.screen.width} x ${window.screen.height}`, userAgent: ua });
    const update = () => setNow(new Intl.DateTimeFormat("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  async function copyIp() {
    if (!ip || ip === "Loading..." || ip === "Unavailable") return;

    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(ip);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = ip;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        textarea.style.pointerEvents = "none";
        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length);
        const ok = document.execCommand("copy");
        document.body.removeChild(textarea);
        if (!ok) throw new Error("Copy command failed");
      }

      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="card">
        <header className="hero">
          <div className="globe">◎</div>
          <h1>IP Address Lookup</h1>
          <div className="vn-title">Tra cứu địa chỉ IP</div>
          <p>Your current network information</p>
          <p className="vi">Thông tin mạng hiện tại của bạn</p>
        </header>

        <section className="ip-panel">
          <div className="ip-label"><strong>Your Current IP Address</strong><span>Địa chỉ IP hiện tại của bạn</span></div>
          <div className="ip-line"><div className="ip-address">{ip}</div><button onClick={copyIp} className={copied ? "copy copied-state" : "copy"} aria-label={copied ? "IP copied" : "Copy IP"} title={copied ? "Copied" : "Copy IP"}>
            {copied ? (
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>
            )}
          </button></div>
          <div className={copied ? "copied show" : "copied"}>Copied! <span>Đã sao chép!</span></div>
        </section>

        <section className="details">
          <div className="section-title"><h2>Additional Information</h2><span>Thông tin bổ sung</span></div>
          <div className="rows">
            <Row icon="◉" en="Browser" vi="Trình duyệt" value={device.browser} />
            <Row icon="▰" en="Operating System" vi="Hệ điều hành" value={device.os} />
            <Row icon="▣" en="Screen Resolution" vi="Độ phân giải màn hình" value={device.resolution} />
            <Row icon="⌁" en="User Agent" vi="User Agent" value={device.userAgent} mono />
            <Row icon="◷" en="Date & Time" vi="Ngày & Giờ" value={now || "Loading..."} />
          </div>
        </section>
      </section>

      <footer>phát triển bởi sku</footer>
    </main>
  );
}
