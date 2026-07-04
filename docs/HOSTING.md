# RoLearn — Deployment Guide (Vercel + Cloudflare + Neon)

Run RoLearn for **$0/month** using Roblox bio verification, free PostgreSQL, and Cloudflare for DNS + media storage.

## Recommended architecture

```
Users → Cloudflare DNS (optional CDN/proxy)
      → Vercel (Next.js app — pages, API, auth)
      → Neon PostgreSQL (database)
      → Cloudflare R2 (photo/video uploads)
```

| Service | What it hosts | Why this one |
|---|---|---|
| **[Vercel](https://vercel.com)** | The website (Next.js) | Best free Next.js hosting, auto-deploy from GitHub |
| **[Neon](https://neon.tech)** | PostgreSQL database | Best free Postgres — 512 MB, serverless, no sleep |
| **[Cloudflare](https://dash.cloudflare.com)** | DNS + R2 file storage | Free DNS, CDN, DDoS protection; R2 has 10 GB free |
| **[GitHub](https://github.com)** | Source code + CI | Free, triggers Vercel deploys on push |

### Why not Supabase?

Neon is simpler for RoLearn — you only need PostgreSQL. Supabase adds auth/storage you don't need (RoLearn has its own Roblox auth). Neon free tier: **512 MB storage**, branching, no project pause on free tier.

### Why Vercel + Cloudflare together?

- **Vercel** runs your Next.js app (the actual site)
- **Cloudflare** sits in front for custom domain DNS, SSL, and caching (optional but recommended for production)
- **Cloudflare R2** stores uploaded images/videos (Vercel doesn't provide file storage)

You do **not** host the app on Cloudflare Pages unless you want to — Vercel is easier for this Next.js setup.

---

## Step-by-step setup

### 1. Database — Neon (free)

1. Go to [console.neon.tech](https://console.neon.tech) → create project `rolearn`
2. Copy the **pooled** connection string
3. Save it — you'll add it to Vercel env vars

```bash
npx prisma db push
```

### 2. Media storage — Cloudflare R2 (free)

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **R2** → Create bucket `rolearn-uploads`
2. Enable public access or attach a custom domain
3. Create API token with **Object Read & Write**
4. Note your account ID from the R2 overview page

### 3. Deploy app — Vercel (free)

1. Push code to GitHub (see below)
2. [vercel.com/dashboard](https://vercel.com/dashboard) → **Add New Project** → import `RoLearn`
3. Add environment variables:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon pooled connection string |
| `AUTH_SECRET` | Random 32+ char secret |
| `NEXTAUTH_SECRET` | Same or another secret |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` (update after first deploy) |
| `NEXTAUTH_URL` | Same as above |
| `OWNER_USERNAMES` | Your Roblox username (gives you Owner panel access) |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 API token key |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret |
| `R2_BUCKET_NAME` | `rolearn-uploads` |
| `R2_PUBLIC_URL` | `https://pub-xxxx.r2.dev` |

4. Click **Deploy**
5. After deploy, update `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` to your real Vercel URL → redeploy

### 4. Custom domain — Cloudflare DNS (optional)

1. Buy a domain or use one you own
2. In Cloudflare → **Add site** → follow nameserver instructions
3. Add a **CNAME** record pointing to Vercel (Project → Settings → Domains shows the exact value)
4. In Vercel → Project → Settings → Domains → add your domain
5. Update env vars to use your custom domain

### 5. Push to GitHub

```bash
git add .
git commit -m "Add owner role, staff badges, and deployment guide"
git push origin main
```

Vercel auto-redeploys on every push to `main`.

---

## Role system

| Role | Badge | Access |
|---|---|---|
| **Owner** | Gold | Full control — analytics, role management, delete content, announcements |
| **Admin** | Purple | Announcements, featured listings, promote mods |
| **Mod** | Blue | Resolve reports, view stats |

Set your Roblox username in `OWNER_USERNAMES` before first login to auto-receive Owner access.

---

## Local development

```bash
git clone https://github.com/popesmoke/RoLearn.git
cd RoLearn
npm install
cp .env.example .env
# Edit .env with your Neon DATABASE_URL and OWNER_USERNAMES
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Login flow

1. Click **Sign in with Roblox**
2. Enter your Roblox username
3. Copy the phrase (e.g. `RL jazz turtle`)
4. Set your Roblox bio to **exactly** that phrase
5. Click **Verify**

---

## Alternative hosts

If Vercel cold starts bother you:

| Platform | Notes |
|---|---|
| **[Railway](https://railway.app)** | Always-on Docker, uses repo `Dockerfile` |
| **[Render](https://render.com)** | Web Service (not Static Site), Docker or Node |

Same Neon + Cloudflare R2 stack works with any of these.

---

## Free tier limits

| Service | Free limit | Enough for |
|---|---|---|
| Neon | 512 MB storage | Thousands of users early on |
| Vercel Hobby | 100 GB bandwidth/mo | Small-to-medium traffic |
| Cloudflare R2 | 10 GB storage | Lots of images/videos |
| Cloudflare DNS | Unlimited | Any traffic |

---

## Troubleshooting

**"Verification failed"** — Bio must match the phrase exactly. Codes expire in 15 minutes.

**Database errors** — Use Neon's **pooled** URL with `?sslmode=require`.

**Build fails** — Ensure `AUTH_SECRET` is 32+ characters and all env vars are set in Vercel.

**Owner panel not showing** — Set `OWNER_USERNAMES` to your exact Roblox username, redeploy, then sign in again.

**Prisma schema changes** — Run `npx prisma db push` after pulling updates.

---

## What you get for $0

- Roblox-verified creator accounts with trust scores
- Public profiles at `/u/username` with role badges
- Marketplace (services + jobs) + team finder
- Direct messages, search, creator dashboard
- Owner/Admin/Mod moderation panel
- PostgreSQL (Neon) + HTTPS (Vercel) + media (R2)
