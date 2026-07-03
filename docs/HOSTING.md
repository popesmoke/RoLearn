# RoLearn — Free Hosting & Setup Guide

Run RoLearn completely free using Roblox bio verification, Vercel hosting, and a free PostgreSQL database.

## Free stack

| Service | Use | Free tier |
|---|---|---|
| [Vercel](https://vercel.com) | Next.js hosting + API routes | Hobby plan |
| [Neon](https://neon.tech) | PostgreSQL database | 512 MB storage |
| [GitHub](https://github.com) | Code + auto-deploy | Free |
| [Icons8](https://icons8.com) | UI icons (loaded via CDN) | Free with attribution |
| [Roblox API](https://create.roblox.com/docs) | Account verification | Free, no API key needed |

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

## 5) Deploy to Vercel (free)

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

## 6) GitHub workflow

```bash
git add .
git commit -m "Your changes"
git push origin main
```

CI runs lint + build on every push. Vercel deploys automatically.

---

## 7) What you get for $0

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
