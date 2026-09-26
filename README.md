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
