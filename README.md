This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Observability

- Metrics endpoint: `GET /api/metrics` (Prometheus format)
- Web Vitals: automatically collected on client and POST to `/api/telemetry/web-vitals`
- Client error reporting: POST to `/api/telemetry/client-error`

### Local Prometheus + Grafana

```
pnpm dev
docker compose up -d prometheus grafana
```

- Prometheus UI: `http://localhost:9090`
- Grafana UI: `http://localhost:3001` (admin/admin)
- Prometheus scrapes Next at `http://host.docker.internal:3000/api/metrics`

### Grafana Dashboard import

1. 打開 Grafana → Dashboards → New → Import
2. 上傳 `ops/grafana/tabseed-dashboard.json`
3. 選擇 Prometheus data source → Import
4. 你會看到 4 個核心面板（RPS、Error Rate、p95、LCP p75）

### Env

Copy `ENV_EXAMPLE.txt` to `.env.local` and adjust.

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Learn More

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
