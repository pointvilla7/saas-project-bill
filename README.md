# 🛡️ ChargeAudit — Production Deployment & Setup Guide

**ChargeAudit** is an automated subscription billing error detection SaaS. It continuously audits connected Stripe accounts, detects failed charges, duplicate invoices, price mismatches, and status anomalies, and sends real-time email alerts to protect recurring SaaS revenue.

---

## 📋 Table of Contents
1. [Tech Stack & Architecture](#-tech-stack--architecture)
2. [Quick Start & Local Development](#-quick-start--local-development)
3. [Environment Variables Reference](#-environment-variables-reference)
4. [Supabase Database Setup & Migrations](#-supabase-database-setup--migrations)
5. [Stripe & Resend Integration Setup](#-stripe--resend-integration-setup)
6. [Deploying to Vercel](#-deploying-to-vercel)
7. [Scheduled Audit Jobs (Vercel Cron)](#-scheduled-audit-jobs-vercel-cron)
8. [Sentry Error Monitoring](#-sentry-error-monitoring)
9. [Health Checks & System Status Page](#-health-checks--system-status-page)
10. [Troubleshooting & Maintenance](#-troubleshooting--maintenance)

---

## 🏗️ Tech Stack & Architecture

- **Framework**: Next.js 14 (App Router, Server Actions, TypeScript)
- **Database & Auth**: Supabase PostgreSQL + `@supabase/ssr` with Row-Level Security (RLS)
- **Billing API Integration**: Stripe Node SDK & Webhooks
- **Email Delivery**: Resend API
- **Cron Automation**: Vercel Cron (`/api/cron/sync-stripe` & `/api/cron/daily-digest`)
- **Error Tracking**: Sentry Free Tier (`@sentry/nextjs`)
- **Styling**: Tailwind CSS + Lucide Icons + Dark Mode Aesthetics

---

## ⚡ Quick Start & Local Development

### Prerequisites
- Node.js 18.x or 20.x
- npm 9.x+
- A free Supabase Project ([supabase.com](https://supabase.com))
- A free Stripe Account ([stripe.com](https://stripe.com))
- A free Resend Account ([resend.com](https://resend.com))

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-org/charge-audit.git
cd charge-audit
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables Reference

ChargeAudit uses different environment keys for **Development** and **Production**.

| Variable Name | Description | Development | Production |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project API URL | `https://dev-ref.supabase.co` | `https://prod-ref.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Public Anon Key | `eyJhbGci...` | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Admin Service Key | `eyJhbGci...` | `eyJhbGci...` |
| `SUPABASE_ENCRYPTION_KEY` | Key encryption passphrase | `dev_passphrase` | `prod_secure_32char_passphrase` |
| `STRIPE_SECRET_KEY` | Stripe Secret API Key | `sk_test_...` | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Signing Secret | `whsec_...` | `whsec_live_...` |
| `STRIPE_STARTER_PRICE_ID` | Starter Plan Stripe Price ID | `price_test_starter` | `price_live_starter` |
| `STRIPE_GROWTH_PRICE_ID` | Growth Plan Stripe Price ID | `price_test_growth` | `price_live_growth` |
| `STRIPE_AGENCY_PRICE_ID` | Agency Plan Stripe Price ID | `price_test_agency` | `price_live_agency` |
| `RESEND_API_KEY` | Resend Email API Key | `re_test_...` | `re_live_...` |
| `RESEND_FROM_EMAIL` | Verified Sender Email | `onboarding@resend.dev` | `alerts@chargeaudit.io` |
| `CRON_SECRET` | Vercel Cron Bearer Token | `dev_cron_secret` | `random_32_char_prod_secret` |
| `SENTRY_DSN` | Sentry Error DSN | `https://sentry...` | `https://sentry...` |
| `NEXT_PUBLIC_APP_URL` | Application Canonical Base URL | `http://localhost:3000` | `https://chargeaudit.io` |

> [!TIP]
> For production deployment settings on Vercel, copy `.env.production.example` into Vercel Project Environment Variables.

---

## 🗄️ Supabase Database Setup & Migrations

### Apply SQL Migrations via Supabase CLI
```bash
# Link to your production Supabase project
npx supabase link --project-ref your-supabase-project-ref

# Apply database migration schema & RLS policies
npx supabase db push
```

### Apply SQL Migrations via Supabase Dashboard
1. Open [Supabase Dashboard](https://supabase.com/dashboard) -> Select Project.
2. Go to **SQL Editor**.
3. Execute the contents of [`supabase/migrations/20260730000000_create_chargeaudit_schema.sql`](file:///d:/new%20bill%20saas%20project/supabase/migrations/20260730000000_create_chargeaudit_schema.sql).
4. Verify RLS policies are enabled on all 5 tables (`users`, `connected_accounts`, `transactions`, `detected_issues`, `alert_settings`).

---

## 💳 Stripe & Resend Integration Setup

### 1. Stripe Setup
1. In Stripe Dashboard (Live Mode), navigate to **Developers -> API Keys**.
2. Copy your **Secret Key** (`sk_live_...`) into `STRIPE_SECRET_KEY`.
3. Under **Developers -> Webhooks**, create an endpoint pointing to:
   `https://your-domain.com/api/webhooks/stripe`
4. Select the following events:
   - `charge.succeeded`
   - `charge.failed`
   - `charge.dispute.created`
   - `customer.subscription.created`
   - `customer.subscription.deleted`
5. Copy the Signing Secret (`whsec_...`) into `STRIPE_WEBHOOK_SECRET`.

### 2. Resend Email Setup
1. Sign up at [Resend.com](https://resend.com).
2. Add and verify your custom sending domain (e.g., `chargeaudit.io`).
3. Generate an API Key and set `RESEND_API_KEY`.
4. Set `RESEND_FROM_EMAIL` to your verified address (e.g., `alerts@chargeaudit.io`).

---

## 🚀 Deploying to Vercel

### Option 1: Vercel GitHub Integration (Recommended)
1. Push your repository to GitHub.
2. Connect your repo to [Vercel](https://vercel.com/new).
3. Under **Environment Variables**, paste all keys from `.env.production.example`.
4. Click **Deploy**.

### Option 2: Deploying via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

---

## ⏰ Scheduled Audit Jobs (Vercel Cron)

ChargeAudit configures two automated background cron tasks in `vercel.json`:

1. **Stripe Data Sync & Issue Audit Worker**:
   - **Path**: `/api/cron/sync-stripe`
   - **Schedule**: Every 6 Hours (`0 */6 * * *`)
   - **Max Duration**: 60 seconds
2. **Daily Executive Email Digest**:
   - **Path**: `/api/cron/daily-digest`
   - **Schedule**: Daily at 8:00 AM UTC (`0 8 * * *`)
   - **Max Duration**: 30 seconds

### Verifying Vercel Cron Security
Vercel automatically sends an `Authorization: Bearer <CRON_SECRET>` header with every cron request.
You can test the endpoint manually:
```bash
curl -X GET https://chargeaudit.io/api/cron/sync-stripe \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 📊 Sentry Error Monitoring

ChargeAudit integrates Sentry free tier for automated error catching across Client, Server, and Edge runtimes.

1. Create a project in [Sentry.io](https://sentry.io).
2. Copy your Sentry DSN.
3. Set `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` in Vercel Environment Variables.
4. Error monitoring will activate automatically. If unconfigured, the application degrades gracefully without throwing errors.

---

## 🩺 Health Checks & System Status Page

- **Health Check Endpoint**: `/api/health`
  - Returns real-time database query latency, Stripe integration status, Resend dispatcher status, and overall system health (`ok`, `degraded`, or `down`).
- **Public Status Page**: `/status`
  - Public dashboard providing real-time system component health, live API latency metrics, 90-day historical uptime bars, and incident history.

---

## 📄 License & Support
For support or setup help, contact `support@chargeaudit.io`.
