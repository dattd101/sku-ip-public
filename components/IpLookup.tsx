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
    fetch("/api/ip", { cache: "no-store" }).then(r => r.json()).then(d => setIp(d.ip)).catch(() => setIp("Unavailable"));
    const ua = navigator.userAgent;
    setDevice({ browser: browserName(ua), os: osName(ua), resolution: `${window.screen.width} x ${window.screen.height}`, userAgent: ua });
    const update = () => setNow(new Intl.DateTimeFormat("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  async function copyIp() {
    if (!ip || ip === "Loading..." || ip === "Unavailable") return;
    await navigator.clipboard.writeText(ip);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
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
          <div className="ip-line"><div className="ip-address">{ip}</div><button onClick={copyIp} className="copy" aria-label="Copy IP">{copied ? "✓" : "▣"}</button></div>
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
