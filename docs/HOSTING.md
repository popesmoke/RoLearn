# RoLearn — Free Hosting Guide

This guide walks you through hosting RoLearn **entirely on free tiers**, using services that scale well when you grow.

## Recommended free stack

| Service | Purpose | Free tier | Why this one |
|---------|---------|-----------|--------------|
| [Vercel](https://vercel.com) | Next.js hosting + serverless API | Hobby plan | Built for Next.js, zero config, auto HTTPS |
| [Neon](https://neon.tech) | PostgreSQL database | 512 MB, 1 project | Serverless Postgres, branches, great with Prisma |
| [Cloudflare R2](https://www.cloudflare.com/products/r2/) | Course videos & uploads | 10 GB storage, no egress fees | Cheapest way to serve large files |
| [Upstash](https://upstash.com) | Redis cache & rate limits | 10K commands/day | Serverless Redis, no server to manage |
| [Resend](https://resend.com) | Transactional email | 100 emails/day | Simple API, good deliverability |
| [GitHub](https://github.com) | Source control + CI | Unlimited public repos | Already using it for this project |

**Alternative all-in-one:** [Supabase](https://supabase.com) can replace Neon + R2 + some auth (500 MB DB, 1 GB file storage). Neon + R2 is better long-term for video-heavy course content.

---

## Architecture overview

```
Users → Vercel (Next.js app + API routes)
           ├── Neon PostgreSQL (users, courses, jobs, reviews)
           ├── Cloudflare R2 (videos, project files, avatars)
           ├── Upstash Redis (sessions cache, rate limiting)
           ├── Resend (welcome emails, job notifications)
           └── Roblox OAuth (identity + profile import)
```

---

## Step 1 — Push code to GitHub

If you haven't already:

```bash
git init
git add .
git commit -m "Initial RoLearn scaffold"
gh repo create RoLearn --public --source=. --remote=origin --push
```

---

## Step 2 — Create the database (Neon)

1. Sign up at [neon.tech](https://neon.tech) (GitHub login works).
2. Click **New Project** → name it `rolearn` → region closest to your users.
3. Copy the **connection string** (Pooled connection, `?sslmode=require`).
4. Save it — you'll add it to Vercel as `DATABASE_URL`.

Run migrations locally first:

```bash
# Copy env template and paste your Neon URL
cp .env.example .env

# Push schema to Neon
npx prisma db push

# (Optional) Open Prisma Studio to browse data
npx prisma studio
```

---

## Step 3 — Deploy to Vercel

1. Sign up at [vercel.com](https://vercel.com) with GitHub.
2. Click **Add New → Project** → import your `RoLearn` repo.
3. Framework preset: **Next.js** (auto-detected).
4. Add environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Neon pooled connection string |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` (update after first deploy) |
| `AUTH_SECRET` | Random string — generate with `openssl rand -base64 32` |
| `ROBLOX_CLIENT_ID` | From Roblox (Step 5) |
| `ROBLOX_CLIENT_SECRET` | From Roblox (Step 5) |
| `ROBLOX_REDIRECT_URI` | `https://your-app.vercel.app/api/auth/roblox/callback` |

5. Click **Deploy**. Vercel builds and hosts automatically on every push to `main`.

### Custom domain (optional, still free on Vercel)

- Vercel → Project → **Settings → Domains** → add your domain.
- Point DNS to Vercel (they show exact records).
- Free `.vercel.app` subdomain works without buying a domain.

---

## Step 4 — File storage (Cloudflare R2)

Course videos and project files need object storage. R2 has **no egress fees**, which matters for video.

1. Create a [Cloudflare](https://dash.cloudflare.com) account.
2. **R2 → Create bucket** → name: `rolearn-uploads`.
3. **Manage R2 API Tokens → Create API token** with Object Read & Write.
4. Add to Vercel env:

| Variable | Value |
|----------|-------|
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | From API token |
| `R2_SECRET_ACCESS_KEY` | From API token |
| `R2_BUCKET_NAME` | `rolearn-uploads` |
| `R2_PUBLIC_URL` | Public bucket URL or custom domain |

5. For public course thumbnails, enable **Public access** on a bucket prefix or use a Cloudflare Worker as a CDN proxy.

**Free tier:** 10 GB storage, 1 million Class A ops, 10 million Class B ops/month.

---

## Step 5 — Roblox OAuth (identity system)

RoLearn uses Roblox as the login provider.

1. Go to [Roblox Creator Dashboard → Credentials](https://create.roblox.com/dashboard/credentials).
2. **Create OAuth 2.0 App**:
   - Name: `RoLearn`
   - Redirect URI: `https://your-app.vercel.app/api/auth/roblox/callback`
   - Scopes: `openid`, `profile` (add more as needed for groups/experiences)
3. Copy **Client ID** and **Client Secret** into Vercel env vars.

Roblox OAuth endpoints:

- Authorize: `https://apis.roblox.com/oauth/v1/authorize`
- Token: `https://apis.roblox.com/oauth/v1/token`
- Userinfo: `https://apis.roblox.com/oauth/v1/userinfo`

After login, import profile data via [Roblox Open Cloud / Users API](https://create.roblox.com/docs/cloud/open-cloud).

---

## Step 6 — Redis cache (Upstash)

Useful for rate limiting, session cache, and leaderboard-style reputation scores.

1. Sign up at [upstash.com](https://upstash.com).
2. **Create Database** → region near Vercel deployment (e.g. `us-east-1`).
3. Copy **REST URL** and **REST Token** to Vercel:

| Variable | Value |
|----------|-------|
| `UPSTASH_REDIS_REST_URL` | REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | REST token |

Install in the app when you implement caching:

```bash
npm install @upstash/redis
```

---

## Step 7 — Email (Resend)

For notifications (job applications, course enrollments, passwordless flows).

1. Sign up at [resend.com](https://resend.com).
2. Create an API key → add `RESEND_API_KEY` to Vercel.
3. Verify a sending domain (or use Resend's test domain for development).

**Free tier:** 100 emails/day, 3,000/month.

---

## Step 8 — CI/CD (automatic, free)

Vercel redeploys on every push to `main`. Optional GitHub Actions for checks:

Create `.github/workflows/ci.yml`:

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run build
        env:
          DATABASE_URL: "postgresql://placeholder:placeholder@localhost/placeholder"
          AUTH_SECRET: "ci-build-secret-min-32-chars-long!!"
```

GitHub Actions free tier: 2,000 minutes/month for private repos, unlimited for public.

---

## Step 9 — Monitoring (optional, free)

| Tool | Use | Free tier |
|------|-----|-----------|
| [Vercel Analytics](https://vercel.com/analytics) | Page views, Web Vitals | Hobby included |
| [Sentry](https://sentry.io) | Error tracking | 5K events/month |
| [Better Stack](https://betterstack.com) | Uptime monitoring | 10 monitors |

---

## Environment checklist

Before going live, confirm all of these are set in **Vercel → Settings → Environment Variables**:

- [ ] `DATABASE_URL`
- [ ] `AUTH_SECRET`
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `ROBLOX_CLIENT_ID`
- [ ] `ROBLOX_CLIENT_SECRET`
- [ ] `ROBLOX_REDIRECT_URI`
- [ ] `R2_*` (when file uploads are implemented)
- [ ] `UPSTASH_*` (when caching is implemented)
- [ ] `RESEND_API_KEY` (when email is implemented)

Redeploy after adding variables: **Deployments → ⋮ → Redeploy**.

---

## Local development

```bash
git clone https://github.com/YOUR_USERNAME/RoLearn.git
cd RoLearn
npm install
cp .env.example .env
# Fill in .env with local/dev credentials
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Cost at scale (when you outgrow free)

Everything above stays free for early traffic. Typical first paid upgrades:

| Trigger | Upgrade | Approx. cost |
|---------|---------|--------------|
| >512 MB database | Neon Launch | ~$19/mo |
| Heavy video traffic | More R2 storage | ~$0.015/GB/mo |
| Team collaboration | Vercel Pro | $20/mo/seat |
| Payments (courses/jobs) | Stripe | 2.9% + $0.30 per transaction |

Stripe has no monthly fee — you only pay per sale, which fits RoLearn's commission model.

---

## Quick reference — service URLs

| Service | Dashboard |
|---------|-----------|
| Vercel | https://vercel.com/dashboard |
| Neon | https://console.neon.tech |
| Cloudflare R2 | https://dash.cloudflare.com → R2 |
| Upstash | https://console.upstash.com |
| Resend | https://resend.com/emails |
| Roblox OAuth | https://create.roblox.com/dashboard/credentials |

---

## Troubleshooting

**Build fails on Vercel:** Ensure `DATABASE_URL` and `AUTH_SECRET` are set even for build (Prisma may need `DATABASE_URL`).

**Roblox OAuth redirect mismatch:** Redirect URI in Roblox dashboard must **exactly** match `ROBLOX_REDIRECT_URI` (including `https`, no trailing slash).

**Database connection errors:** Use Neon's **pooled** connection string for serverless (Vercel). Direct connection is for migrations only.

**Cold starts:** Neon free tier scales to zero. First request after idle may take 1–2s — normal for free serverless Postgres.

---

## Next steps for development

1. Implement Roblox OAuth callback route (`/api/auth/roblox/callback`)
2. Wire Prisma client in API routes
3. Build creator profile pages
4. Add R2 upload for course content
5. Connect Stripe (test mode is free) when ready for paid courses

See the main [README](../README.md) for product vision and feature roadmap.
