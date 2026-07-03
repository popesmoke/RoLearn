# RoLearn — Free Hosting & Setup Guide

Run RoLearn completely free using Roblox bio verification, free PostgreSQL, and free media storage.

## Recommended hosting (faster than Vercel Hobby)

Vercel Hobby can feel slow on cold starts. These options are faster and work great with RoLearn:

| Platform | Speed | Setup |
|---|---|---|
| **[Railway](https://railway.app)** | Fast, always-on | Connect GitHub → uses `Dockerfile` |
| **[Render](https://render.com)** | Fast, free tier | **Web Service** (full app, not Static Site) |
| **[Cloudflare Pages](https://pages.cloudflare.com)** | Global edge | Next.js via OpenNext adapter |
| Vercel | Good, cold starts on free | GitHub integration (default) |

**Recommended production stack:** Railway or Render + Neon PostgreSQL + Cloudflare R2

### Render is not backend-only

Render has different service types. RoLearn needs a **Web Service** — that runs the whole Next.js app:

- Pages (`/`, `/explore`, `/compose`, …)
- API routes (`/api/feed`, `/api/upload`, live SSE stream)
- Server actions and auth

Do **not** pick **Static Site** on Render. That is frontend-only (HTML/CSS/JS files) and cannot run RoLearn’s server code, uploads, or live feed.

On Render: **New → Web Service** → connect GitHub → Docker (uses repo `Dockerfile`) or Node with `npm run build` + `npm start`.

R2 is required for photos/videos in production (any host):
1. [dash.cloudflare.com](https://dash.cloudflare.com) → R2 → Create bucket `rolearn-uploads`
2. Enable public access or attach a custom domain
3. Create API token with Object Read & Write
4. Add to env:

```env
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="rolearn-uploads"
R2_PUBLIC_URL="https://pub-xxxx.r2.dev"
```

---

## Free stack

| Service | Use | Free tier |
|---|---|---|
| [Railway](https://railway.app) / [Render](https://render.com) | Fast Next.js hosting (Docker) | Free tiers available |
| [Neon](https://neon.tech) | PostgreSQL database | 512 MB storage |
| [Cloudflare R2](https://www.cloudflare.com/products/r2/) | Photos & video uploads | 10 GB free |
| [GitHub](https://github.com) | Code + auto-deploy | Free |
| [Icons8](https://icons8.com/icons/all) | UI icons (CDN, themed) | Free with attribution |
| [Roblox API](https://create.roblox.com/docs) | Account verification | Free, no API key needed |
| [Vercel](https://vercel.com) | Alternative Next.js host | Hobby plan |

Optional later (still free tiers available):

| Service | Use |
|---|---|
| [Cloudflare R2](https://www.cloudflare.com/products/r2/) | File uploads (10 GB free) |
| [Upstash](https://upstash.com) | Redis cache (10K commands/day) |
| [Resend](https://resend.com) | Email (100/day) |

---

## 1) Clone and install

```bash
git clone https://github.com/popesmoke/RoLearn.git
cd RoLearn
npm install
cp .env.example .env
```

## 2) Create a free Neon database

1. Go to [console.neon.tech](https://console.neon.tech)
2. Create a project named `rolearn`
3. Copy the **pooled** connection string
4. Paste it into `.env`:

```env
DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"
```

Push the schema:

```bash
npx prisma db push
```

## 3) Set environment variables

Edit `.env`:

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="your-random-secret-here"
NEXTAUTH_SECRET="same-or-different-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
```

Generate a secure secret:

```bash
# macOS / Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

No Google OAuth or Roblox API keys are required — login uses Roblox bio verification.

## 4) Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### How login works

1. Click **Sign in with Roblox**
2. Enter your Roblox username
3. Copy the generated phrase (e.g. `RL jazz turtle`)
4. Set your Roblox profile bio to **only** that code
5. Click **Verify** — RoLearn checks your bio via the Roblox API
6. Change your bio back anytime after signing in

---

## 5) Deploy to Railway or Render (recommended)

Both host the **entire** RoLearn app — UI and backend together.

### Railway (easiest)

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
2. Select the RoLearn repo (uses `Dockerfile` automatically)
3. Add env vars: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, `NEXTAUTH_URL`, plus R2 vars for media
4. Deploy → copy the public URL → set `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` to that URL

### Render (Web Service)

1. [render.com](https://render.com) → **New +** → **Web Service** (not Static Site)
2. Connect GitHub repo
3. **Environment:** Docker *or* Node with build `npm install && npm run build`, start `npm start`
4. Add the same env vars as above
5. Free tier spins down after ~15 min idle (first visit may be slow); paid tier stays warm

---

## 6) Deploy to Vercel (alternative)

1. Push your repo to GitHub
2. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
3. **Add New Project** → import your RoLearn repo
4. Add these environment variables:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon pooled connection string |
| `AUTH_SECRET` | Random 32+ char secret |
| `NEXTAUTH_SECRET` | Same or another secret |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |

5. Click **Deploy**

After deploy, run `npx prisma db push` against your production database if tables don't exist yet (or run it locally with the production `DATABASE_URL`).

Vercel auto-redeploys on every `git push` to main.

---

## 7) GitHub workflow

```bash
git add .
git commit -m "Your changes"
git push origin main
```

CI runs lint + build on every push. Vercel deploys automatically.

---

## 8) What you get for $0

- Roblox-verified creator accounts
- Public profiles at `/u/username`
- Marketplace (services + jobs)
- Team finder with apply buttons
- Direct messages between creators
- Search with skill/type filters
- Creator studio dashboard
- PostgreSQL database (Neon free tier)
- HTTPS hosting (Vercel free tier)

---

## 8) Troubleshooting

**"Verification failed"**
- Bio must contain **exactly** the phrase — no extra text, spaces, or emojis
- Wait a few seconds after saving your Roblox bio before clicking Verify
- Codes expire after 15 minutes — generate a new one if needed

**Database connection errors**
- Use Neon's **pooled** connection string (not direct)
- Ensure `?sslmode=require` is in the URL

**Build fails on Vercel**
- Check all env vars are set
- `AUTH_SECRET` must be at least 32 characters

**Roblox avatar not loading**
- Roblox CDN URLs are allowed in `next.config.ts` — redeploy if you changed config

**Prisma schema changes**
- Run `npx prisma db push` after pulling updates
- Run `npx prisma generate` if types are stale

---

## 9) Staying free long-term

- Neon free tier: 512 MB — plenty for early stage
- Vercel Hobby: 100 GB bandwidth/month — enough for thousands of users
- Roblox API: no rate limits for basic user lookups at small scale
- Icons8: icons load from their CDN (free tier)

When you outgrow free tiers, Neon and Vercel have affordable paid plans. But you can launch and run a real product on $0/month.

---

## 10) Optional upgrades (still mostly free)

### Cloudflare R2 for uploads

```env
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME="rolearn-uploads"
R2_PUBLIC_URL=""
```

### Upstash Redis for caching

```env
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
```

### Resend for email notifications

```env
RESEND_API_KEY=""
```

These are wired in `.env.example` for future use — not required to launch.
