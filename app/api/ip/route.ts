import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function normalizeCandidate(value: string) {
  let ip = value.trim();
  if (ip.startsWith("::ffff:")) ip = ip.slice(7);
  // x-real-ip can occasionally contain an IPv4 port.
  const withPort = ip.match(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/);
  return withPort ? withPort[1] : ip;
}

function isValidIpv4(ip: string) {
  const parts = ip.split(".");
  return parts.length === 4 && parts.every((part) => {
    if (!/^\d{1,3}$/.test(part)) return false;
    const n = Number(part);
    return n >= 0 && n <= 255;
  });
}

function isPublicIpv4(ip: string) {
  if (!isValidIpv4(ip)) return false;
  const [a, b] = ip.split(".").map(Number);

  // Non-public/special IPv4 ranges.
  if (a === 0 || a === 10 || a === 127) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && b === 168) return false;
  if (a === 100 && b >= 64 && b <= 127) return false; // CGNAT
  if (a >= 224) return false;
  return true;
}

function ipv4Candidates(value: string | null) {
  if (!value) return [];
  return value
    .split(",")
    .map(normalizeCandidate)
    .filter(isPublicIpv4);
}

export function GET(request: NextRequest) {
  const headerValues = [
    request.headers.get("cf-connecting-ip"),
    request.headers.get("true-client-ip"),
    request.headers.get("x-real-ip"),
    request.headers.get("x-forwarded-for"),
  ];

  // IMPORTANT: return ONLY a public IPv4. IPv6 is intentionally ignored.
  const ip = headerValues.flatMap(ipv4Candidates)[0] ?? null;

  return NextResponse.json(
    { ip, needsClientLookup: !ip, family: ip ? 4 : null },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
