# RoLearn — Deploy on Vercel (no domain needed)

Run RoLearn for **$0/month** with just **Vercel + Neon**. You do **not** need to buy a domain — use the free `your-app.vercel.app` URL.

---

## What you need

| Service | What it does | Credit card? |
|---|---|---|
| **[Vercel](https://vercel.com)** | Hosts the website | No (Hobby plan) |
| **[Neon](https://neon.tech)** | PostgreSQL database | No |
| **[Supabase](https://supabase.com)** | File storage (images, PDFs) | **No** |
| **[GitHub](https://github.com)** | Code + auto-deploy | No |

You do **not** need Cloudflare or a custom domain to launch.

---

## Architecture (minimal)

```
Users → https://your-app.vercel.app  (Vercel)
              ↓
        Neon PostgreSQL  (database)
              ↓
        Supabase Storage  (uploads — optional but recommended)
```

---

## Step 1 — Neon database (5 min)

1. Go to [console.neon.tech](https://console.neon.tech) and sign up (GitHub login works)
2. **New Project** → name it `rolearn`
3. Copy the **pooled** connection string (must include `?sslmode=require`)
4. Keep it for Step 3

Push the schema once (from your PC):

```bash
cd RoLearn
npm install
cp .env.example .env
# Paste DATABASE_URL into .env
npx prisma db push
```

---

## Step 2 — Supabase file storage (10 min, no credit card)

Cloudflare R2 also works but **requires a credit card** on Cloudflare. If you don't have one, use **Supabase Storage** instead — **1 GB free, no card**.

### Create Supabase project (storage only)

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Pick a name and password (you won't use this DB — RoLearn uses Neon)
3. Wait ~2 minutes for the project to spin up

### Create a public bucket

1. Left sidebar → **Storage**
2. **New bucket** → name: `uploads`
3. Turn **Public bucket** ON → Create

### Get API keys

1. **Project Settings** (gear icon) → **API**
2. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** key (under Project API keys) → `SUPABASE_SERVICE_ROLE_KEY`  
     ⚠️ Keep this secret — server-only, never expose in client code

---

## Step 3 — Deploy on Vercel (10 min)

### Import from GitHub

1. Push your code to GitHub (or use the existing `popesmoke/RoLearn` repo)
2. Go to [vercel.com/new](https://vercel.com/new)
3. **Import** the RoLearn repository
4. Leave build settings as default → **Deploy** (first deploy may fail — that's OK, we need env vars)

### Environment variables

Vercel → your project → **Settings** → **Environment Variables**

Add these for **Production** (and Preview if you want):

| Variable | Value | Example |
|---|---|---|
| `DATABASE_URL` | Neon pooled connection string | `postgresql://user:pass@...neon.tech/neondb?sslmode=require` |
| `AUTH_SECRET` | Random 32+ character string | generate below |
| `NEXTAUTH_SECRET` | Same as `AUTH_SECRET` or another random string | |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL | `https://rolearn.vercel.app` |
| `NEXTAUTH_URL` | Same as above | `https://rolearn.vercel.app` |
| `OWNER_USERNAMES` | Your Roblox username | `YourRobloxName` |
| `SUPABASE_URL` | From Supabase → Settings → API | `https://abcdefgh.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key from Supabase | `eyJhbG...` |
| `SUPABASE_BUCKET_NAME` | `uploads` | `uploads` |

**Generate a secret** (PowerShell):

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### Find your Vercel URL

After first deploy: Vercel → **Deployments** → open the site.  
URL looks like `https://rolearn-xxxxx.vercel.app` or `https://rolearn.vercel.app`.

Set `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` to that **exact** URL (with `https://`), then **Redeploy** (Deployments → ⋯ → Redeploy).

### Push database schema to production

On your PC, with production `DATABASE_URL` in `.env` (or one-off):

```bash
npx prisma db push
```

Or run it in Vercel's build — the repo `scripts/build.mjs` already runs `prisma generate`; schema push is done locally against the Neon URL.

---

## Step 4 — Test

1. Open `https://your-app.vercel.app`
2. **Sign in with Roblox** (bio verification)
3. Try **Studio → Portfolio** → upload an image
4. Try **Create** → add a photo to a post
5. Try **Studio → Courses** → written guide (works even without storage)

---

## No storage? You can still launch

These work **without** any file storage:

- Roblox login & profiles
- Written courses (text only, no PDF)
- Services, jobs, team posts (text only)
- Messages, search, admin panel

Add Supabase Storage when you want images, videos, or PDF courses.

---

## Storage options compared

| Option | Credit card? | Free storage | Best for |
|---|---|---|---|
| **Supabase Storage** ✅ | **No** | 1 GB | You — no card, works on Vercel |
| Cloudflare R2 | **Yes** (Cloudflare asks for card) | 10 GB | Later, if you get a card |
| Uploadthing | No | 2 GB | Next.js apps (needs extra setup) |
| Local `public/uploads/` | No | N/A | Dev only — **not** persistent on Vercel |

RoLearn tries **R2 first** (if `R2_*` vars are set), then **Supabase**, then local files (dev only).

---

## Optional later: custom domain

When you buy a domain:

1. Vercel → Project → **Settings** → **Domains** → add your domain
2. Follow Vercel's DNS instructions at your registrar
3. Update `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` to `https://yourdomain.com`
4. Redeploy

You can use Cloudflare for DNS then — see [CLOUDFLARE.md](./CLOUDFLARE.md).

---

## Troubleshooting

**Upload fails on Vercel**  
→ Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_BUCKET_NAME`. Bucket must be **public**.

**Roblox login fails after deploy**  
→ `NEXTAUTH_URL` must match your site URL exactly (including `https://`).

**"Verification failed"**  
→ Bio must match the phrase exactly. Code expires in 15 minutes.

**Database connection error**  
→ Use Neon's **pooled** URL with `?sslmode=require`.

**Site feels slow between pages**  
→ Vercel Hobby has cold starts after ~5 min idle. First click may take 1–3s. Loading skeletons should appear instantly. For always-on hosting, see Railway in [CLOUDFLARE.md](./CLOUDFLARE.md#alternative-always-on-hosting).

**Supabase project paused**  
→ Free Supabase projects pause after 7 days idle. Open the dashboard and click **Restore** — storage still works.

---

## Quick checklist

- [ ] Neon database created, `DATABASE_URL` in Vercel
- [ ] `npx prisma db push` run against production DB
- [ ] `AUTH_SECRET` + `NEXTAUTH_SECRET` set
- [ ] `NEXT_PUBLIC_APP_URL` + `NEXTAUTH_URL` = your `*.vercel.app` URL
- [ ] `OWNER_USERNAMES` = your Roblox username
- [ ] Supabase bucket `uploads` (public) + 3 `SUPABASE_*` env vars
- [ ] Redeploy after changing env vars
- [ ] Sign in and test an image upload

---

## Local development

```bash
git clone https://github.com/popesmoke/RoLearn.git
cd RoLearn
npm install
cp .env.example .env
# Add DATABASE_URL and OWNER_USERNAMES
npx prisma db push
npm run dev
```

Uploads save to `public/uploads/` locally — no Supabase needed on your PC.
