# TabSeed

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

## Chrome Extension (development)

1. Build is not required. Load as unpacked directly:
   - Open Chrome → Extensions → Enable Developer mode
   - Click "Load unpacked"
   - Select `extensions/chrome`
2. Verify the service worker is running; click the extension details → Service worker.
3. From the app (Inbox/Kanban), click the "匯入分頁" FAB → choose target and optionally enable "匯入後關閉已擷取的分頁".
4. Without the extension installed, the app falls back to capturing only the current tab.

> Files: `extensions/chrome/manifest.json`, `background.js`, `content.js`.

## Auth

- Routes
  - `GET /api/auth/google` → redirect to Google OAuth
  - `GET /api/auth/google/callback` → exchange code, validate state, check allowlist, set session
  - `GET /api/auth/session` → return current session JSON
  - `POST /api/auth/test-login` → test code login (early alpha)
  - `POST /api/waitlist` → submit waitlist entry
  - `GET /api/admin/waitlist?token=...` → list waitlist entries (admin)
  - `PATCH /api/admin/waitlist?token=...` → approve/reject entry (admin)
- Pages
  - `/login` → main login (Google + link to waitlist and test login)
  - `/login/test` → test-code login page (temporary)
  - `/waitlist` → public waitlist page（支援 `?email=` 預填）
  - `/waitlist/need-join` → 尚未加入 waitlist 時的引導頁（帶 email 參數）
  - `/waitlist/pending` → 已在 waitlist 但尚未核准的提示頁（帶 email 參數）
- Middleware
  - Protects private routes and redirects unauthenticated users to `/login`
  - Public paths include `/`, `/login`, `/login/test`, `/waitlist`, `/waitlist/need-join`, `/waitlist/pending`, and auth/waitlist/admin APIs
- Env
  - `ALLOWLIST_EMAILS=you@example.com,teammate@example.com`
  - `GOOGLE_CLIENT_ID=...`
  - `GOOGLE_CLIENT_SECRET=...`
  - `OAUTH_REDIRECT_BASE_URL=http://localhost:3000`
  - `TEST_LOGIN_CODES=dev123,dev456`
  - `ADMIN_TOKEN=dev-admin-token`

Notes
- In development, session cookies are not `Secure`; in production they are.
- Not on allowlist → Google callback 會檢查 DB：
  - 無 waitlist 記錄 → redirect `/waitlist/need-join?email=...`
  - 已存在但未核准 → redirect `/waitlist/pending?email=...`
- Replace or extend allowlist with DB-driven approval if needed.
