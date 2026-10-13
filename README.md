# Trading VIP Membership

Telegram-gated, 30-day paid membership for a trading-education community. React + Vite + Tailwind frontend, Vercel Functions backend, Supabase (Postgres/Auth/RLS), Razorpay payments, Telegram Bot API.

**Status: Phases 1–2 complete (architecture + working frontend).** The `/api` functions, SQL migrations, Razorpay webhook, Telegram bot, cron and full deployment guide arrive in Phases 3–8. Until then the pages run against a built-in mock layer. See `docs/ARCHITECTURE.md`.

## Set up on macOS

```bash
# Homebrew (skip if installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node@22 git
brew install --cask visual-studio-code
node -v   # v22.x
```

If `node` isn't found after installing, run `brew link --overwrite node@22` (or add the Homebrew `node@22` bin directory to your PATH).

## Run it

```bash
cd trading-vip
npm install
cp .env.example .env.local        # then set VITE_UI_MOCK=true for the offline preview
npm run dev                       # http://localhost:5173
```

Offline preview URLs (mock data, dev server only):

| Page | URL |
|---|---|
| Landing | `/` |
| Checkout, new member | `/checkout?t=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa` |
| Checkout, renewal | `/checkout?t=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaarenew` |
| Invalid link | `/checkout?t=invalidxxxxxxxxxxxxxxxxxxxxxxxxx` |
| Payment status | pay on checkout; it resolves pending → invite pending → success |
| Member hub | `/member` |
| Admin | `/admin` (skips login in mock mode) |

Other commands: `npm run typecheck`, `npm test`, `npm run build`, `npm run preview`.

## What changed from the raw Stitch export (and why)

- **Landing CTAs open the Telegram bot** instead of the checkout page, because checkout needs the signed, user-bound link the bot creates.
- **Checkout no longer asks for Telegram handle, email or WhatsApp.** Identity comes from the signed link only; Razorpay collects contact details. WhatsApp delivery doesn't exist in this system.
- **Removed claims that were invented or that the system can't honour:** "1,420 learners", "92.4% retention", "4.9/5 rating", "Cohort #14", the public `@TradingVIP_MasterClass` handle (a public handle contradicts single-use invites), "PCI-DSS / RBI compliant", "cancel anytime / autopay", the fake ₹499 waived fee, the fake GST split, and "invite on screen + WhatsApp + email". Invites are delivered only by the bot, privately.
- **Hero panel:** the live NIFTY "execution zone / target" readout looked like a trade call, so it's now a clearly labelled hypothetical position-sizing example.
- **Risk checkbox is unchecked by default** and validated (React Hook Form + Zod).
- **"Test rig" and fake payment simulation removed;** real states (loading, cancelled, failed, network error) are driven by actual outcomes.
- **Brand mark is an inline SVG**; the Stitch export linked to a hosted image that may expire. Replace `src/components/Logo.tsx` with your final logo.
- Material Symbols icons are mapped to Lucide equivalents (per the required stack).

## You must decide before taking real money

- **SEBI / legal:** daily market analysis or trade reviews sold for a fee may count as research analysis or investment advice under Indian rules. Get legal advice first. The Terms, Privacy and Refund pages are drafts with `[placeholders]`, not legal cover.
- **Facts on the site that only you can confirm:** the list of inclusions, "not a SEBI-registered RA/IA" statements, support email, business name and address.
- **GST:** the site shows a single INR price. If you must show or invoice GST, decide how with your accountant; the Stitch breakdown was a placeholder.
