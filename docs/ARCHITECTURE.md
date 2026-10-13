# Trading VIP — Architecture (Phase 1)

One repo, one Vercel project: a Vite/React SPA served as static assets plus TypeScript serverless functions under `/api`. All privileged work (pricing, payment verification, Telegram calls, DB writes with the service role) is server-side. Supabase holds all durable state; nothing relies on in-memory queues or local disk.

## File tree

```
trading-vip/
├── index.html · vite.config.ts · tailwind.config.ts · tsconfig.json · vercel.json · .env.example
├── shared/contracts.ts          Zod schemas = the API contract (used by frontend now, by /api in Phase 4+)
├── src/
│   ├── main.tsx · App.tsx · index.css
│   ├── layouts/SiteLayout.tsx   header, footer, mobile nav, test-mode banner
│   ├── pages/                   Landing · Checkout · PaymentStatus · Member · Legal · NotFound
│   │   └── admin/               AdminGuard · AdminLogin · AdminDashboard (lazy-loaded chunk)
│   ├── components/              ui.tsx (buttons, badges, cards, notices) · Logo · RiskNotice
│   ├── hooks/                   usePublicConfig · useLinkSession · usePaymentStatus · useServerNow
│   └── lib/                     api.ts (typed client) · mock.ts (dev-only) · razorpay.ts · supabase.ts · format.ts
├── api/                         (Phases 4–7)
│   ├── public-config.ts                       GET   display config
│   ├── telegram/webhook.ts                    POST  bot updates (/start /join /status /help)
│   ├── membership/validate-link.ts            POST  signed link -> httpOnly session cookie
│   ├── membership/session.ts                  GET   current session
│   ├── membership/status.ts                   GET   ?orderId= -> order state | no param -> dashboard
│   ├── membership/renew.ts                    POST  (server-side renewal helper)
│   ├── razorpay/create-order.ts               POST  server-priced order
│   ├── razorpay/webhook.ts                    POST  payment.captured etc. (raw body + HMAC)
│   ├── admin/{summary,members,orders,retry-invitation}.ts
│   └── cron/process-expiries.ts               GET   CRON_SECRET-protected
├── supabase/migrations/ · seed.sql            (Phase 3)
├── tests/                                     (unit now; webhook/expiry/RLS in Phase 7)
└── docs/ARCHITECTURE.md
```

Differences from the suggested tree: added `public-config`, `membership/validate-link`, `membership/session` and `admin/summary`, because the customer flow needs a link-exchange step and the admin dashboard needs aggregate metrics.

## Identity model (no trust in the browser)

1. `/start` in the bot stores `telegram_user_id` + `chat_id` (from Telegram's update, never from the website).
2. The bot builds a link `SITE_URL/checkout?t=<token>`. Token = base64url(payload) + HMAC-SHA256 signature using `LINK_SIGNING_SECRET`; payload holds `sub` (telegram user id), `jti`, `iat`, `exp` (short, ~30 min), `purpose`.
3. The page POSTs the token to `/api/membership/validate-link`. The server verifies signature/expiry/purpose, then sets a short-lived, signed, `HttpOnly; Secure; SameSite=Lax` session cookie bound to the Telegram user and returns a display-only summary.
4. The frontend removes `?t=` from the URL immediately (router `replace`), so the token does not linger in history or referrers.
5. Every member endpoint (create-order, status, dashboard) reads identity only from that cookie. Order lookups additionally check `orders.member_id == session.member_id` (IDOR protection).
6. All state-changing member calls require the custom header `X-Requested-With: trading-vip` and same-origin cookies; no CORS is enabled for them.
7. Admins use Supabase Auth; each `/api/admin/*` call verifies the bearer JWT server-side and checks membership in `admin_users`. The UI guard is cosmetic.

## Money and payment flow

- Price and duration come from `MEMBERSHIP_PRICE_INR` / `MEMBERSHIP_DURATION_DAYS`; stored as integer paise, currency `INR`. `create-order` takes **no** amount input.
- Browser callbacks only navigate to `/payment/status?order=<uuid>`; that page polls `GET /api/membership/status?orderId=` (max 40 polls / 3 min, backoff 3 s → 8 s).
- `razorpay/webhook.ts` reads the raw body, verifies `X-Razorpay-Signature` (HMAC-SHA256, constant-time compare), de-duplicates on `X-Razorpay-Event-Id`, checks order ownership, amount, currency and `captured`, then calls one SQL function that activates/extends the membership in a single transaction guarded by a unique `payments.razorpay_payment_id`.
- Renewal rule: `new_expiry = max(current_expiry, now) + duration`.
- Invitation delivery is a separate, retryable step recorded in `invitation_deliveries`; retries never touch the expiry.
- Refund/chargeback events mark the payment and (policy-dependent) shorten/revoke the membership.

## Expiry automation

`vercel.json` will register `/api/cron/process-expiries` (Phase 6). Vercel invokes cron over HTTP in **UTC** and sends `Authorization: Bearer $CRON_SECRET`; the handler rejects anything else. Frequency is limited by your Vercel plan (Hobby is restricted to daily runs — confirm current limits), so removal happens up to one cycle after expiry, not at the exact second. Each batch re-reads the member's expiry immediately before removal, uses `banChatMember` + `unbanChatMember` (so they can rejoin on renewal), and is idempotent.

## Vercel conventions to keep

- `package.json` has `"type": "module"`: in `/api` use relative imports **with `.js` extensions** (e.g. `../../shared/contracts.js`).
- Functions that need raw bodies (Razorpay webhook) disable the body parser and read the stream.
- SPA fallback is `rewrites: /((?!api/).*) -> /index.html`; static files and `/api/*` are served before it.
- Security headers and CSP live in `vercel.json`; the CSP allows Razorpay Checkout, Google Fonts and Supabase. Re-test checkout in test mode after any CSP change.

## Stitch design handling

Colours, type scale, spacing and radii in `tailwind.config.ts` are extracted programmatically from the Stitch export, and component markup keeps its class structure. Deliberate changes for correctness/compliance are listed in the README.
