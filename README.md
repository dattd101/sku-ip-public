# IP P.A Vietnam UI Clone

A Next.js 15 / TypeScript implementation inspired by the public layout and information structure of ip.pavietnam.vn.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Production

```bash
npm run build
npm start
```

## IP detection

`/api/ip` checks common reverse-proxy headers in this order: `cf-connecting-ip`, `x-real-ip`, then the first value of `x-forwarded-for`. On localhost it may fall back to `127.0.0.1`.

When deploying behind your own Nginx/proxy, make sure it forwards the client IP headers correctly.

## Public IP detection

When deployed behind a reverse proxy/CDN, `/api/ip` reads the visitor IP from forwarding headers. During local development those headers often contain only a private Docker/LAN address such as `::ffff:192.168.x.x`; the UI therefore falls back to a browser-side request to `api64.ipify.org`, which sees the visitor's actual public Internet address.


## Public IPv4 only
This version intentionally displays only the visitor public IPv4. IPv6 and private/LAN addresses are ignored. If the deployment proxy does not provide a public IPv4 header, the browser falls back to the IPv4-only api.ipify.org endpoint.
