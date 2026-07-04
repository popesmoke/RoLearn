# RoLearn — Deploy on Cloudflare Workers (recommended)

Run RoLearn for **$0/month** with **Cloudflare Workers + Neon + PutPut**. No custom domain needed — use `rolearn.<your-subdomain>.workers.dev`.

---

## Is Cloudflare the right choice?

| | Cloudflare Workers | Vercel Hobby |
|---|---|---|
| **Cold starts** | Fast (edge, always warm) | Slow (1–3s after idle) |
| **Next.js support** | Via OpenNext adapter | Native |
| **Free URL** | `*.workers.dev` | `*.vercel.app` |
| **Credit card** | Not required (Workers free) | Not required |
| **File uploads** | PutPut (no card) | PutPut / Supabase |

**Verdict:** Moving to Cloudflare is a good decision for RoLearn — especially if Vercel felt slow. PutPut stores files on Cloudflare R2 behind the scenes, so uploads and hosting stay on the same network.

---

## Architecture

```
Users → https://rolearn.yourname.workers.dev  (Cloudflare Workers)
              ↓
        Neon PostgreSQL  (database)
              ↓
        PutPut  (images, videos, PDFs — no credit card)
```

| Service | Role |
|---|---|
| **Cloudflare Workers** | Hosts the Next.js app |
| **Neon** | PostgreSQL database |
| **PutPut** | File storage (free, no card) |
| **GitHub** | Code + auto-deploy via Workers Builds |

---

## Step 1 — Neon database + Prisma Accelerate

Cloudflare Workers **free tier** has a **3 MB** bundle limit. Prisma's query engine alone exceeds that, so you need **Prisma Accelerate** (free tier, no credit card) to proxy database queries without bundling the engine.

### 1a — Create Neon database

1. [console.neon.tech](https://console.neon.tech) → new project `rolearn`
2. Copy the **pooled** connection string — this becomes `DIRECT_DATABASE_URL`

### 1b — Enable Prisma Accelerate (required for Cloudflare free tier)

1. [console.prisma.io](https://console.prisma.io) → sign up (free)
2. Create a project → **Enable Accelerate**
3. Paste your Neon connection string as the database URL
4. Copy the **Accelerate connection string** (`prisma://accelerate.prisma-data.net/?api_key=...`)

### 1c — Push schema

```bash
npx prisma db push
```

Uses `DIRECT_DATABASE_URL` from your `.env` automatically.

---

## Step 2 — PutPut file storage (no credit card)

PutPut handles images, videos, and PDFs. Files are stored on Cloudflare R2 via PutPut — you never touch R2 directly.

### Get your token (do this once)

```bash
curl -X POST https://putput.io/api/v1/auth/guest
```

Response:

```json
{ "token": "pp_xxxxxxxx" }
```

**Important:**
- You can only create **3 guest tokens per day** — save the token immediately
- Guest tokens **expire after 30 days** — generate a new one before expiry
- The token is a **server secret** — never put it in client code or commit it to GitHub

### Where to put `PUTPUT_TOKEN`

| Environment | Where |
|---|---|
| **Local dev** | `.env` → `PUTPUT_TOKEN=pp_...` |
| **Cloudflare Workers** | Dashboard → Workers → rolearn → **Settings → Variables → Secrets** |
| **Never** | Browser, GitHub, `NEXT_PUBLIC_*` vars |

In Cloudflare: add as **Encrypted** secret named exactly `PUTPUT_TOKEN`.

---

## Step 3 — Deploy to Cloudflare Workers

### Option A — GitHub auto-deploy (recommended)

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create**
2. Choose **Connect to Git** → select `popesmoke/RoLearn`
3. Build settings:

| Setting | Value |
|---|---|
| Build command | `npm run build:cf` |
| Deploy command | `npx opennextjs-cloudflare deploy` |
| Non-production branch deploy | `npx opennextjs-cloudflare upload` |

Do **not** use `npm run deploy:cf` as the build command — it builds and deploys in one step, which conflicts with the separate deploy phase in Workers Builds.

4. Add **environment variables** (Settings → Variables):

| Variable | Type | Value |
|---|---|---|
| `DATABASE_URL` | Encrypted | **Prisma Accelerate** URL (`prisma://accelerate...`) |
| `DIRECT_DATABASE_URL` | Encrypted | Neon pooled URL (for migrations only, optional in Workers) |
| `AUTH_SECRET` | Encrypted | Random 32+ chars |
| `NEXTAUTH_SECRET` | Encrypted | Same or another secret |
| `NEXT_PUBLIC_APP_URL` | Plain | `https://rolearn.yourname.workers.dev` |
| `NEXTAUTH_URL` | Plain | Same as above |
| `OWNER_USERNAMES` | Plain | Your Roblox username |
| `PUTPUT_TOKEN` | **Encrypted** | `pp_...` from Step 2 |

5. Deploy → copy your `*.workers.dev` URL → update the two URL vars → redeploy

### Option B — Deploy from your PC

```bash
npm install
npx prisma db push   # once, against Neon
npm run deploy:cf
```

First time: `npx wrangler login` to authenticate.

### Push schema to production

```bash
# With production DATABASE_URL in .env
npx prisma db push
```

---

## Step 4 — Test

1. Open your `*.workers.dev` URL
2. Sign in with Roblox
3. **Studio → Portfolio** → upload an image (should return a `cdn.putput.io` URL)
4. Navigate between pages — should feel faster than Vercel cold starts

---

## Local development

```bash
git clone https://github.com/popesmoke/RoLearn.git
cd RoLearn
npm install
cp .env.example .env
# Add DATABASE_URL, OWNER_USERNAMES, PUTPUT_TOKEN
npx prisma db push
npm run dev
```

Without `PUTPUT_TOKEN`, uploads save to `public/uploads/` locally.

Preview in the Workers runtime locally:

```bash
npm run preview:cf
```

---

## Storage priority

RoLearn picks storage automatically:

1. **PutPut** — if `PUTPUT_TOKEN` is set ✅ recommended
2. Cloudflare R2 — if `R2_*` vars are set (needs credit card)
3. Supabase — if `SUPABASE_*` vars are set
4. Local `public/uploads/` — dev only

---

## PutPut token — what to do with it

Your `pp_...` token is like a database password:

1. **Add to Cloudflare** as encrypted secret `PUTPUT_TOKEN`
2. **Add to local `.env`** for development (never commit)
3. **Do not** expose in the browser or `NEXT_PUBLIC_*` variables
4. **Do not** call `/auth/guest` again unless the token expired (30 days)
5. When it expires, generate a new token and update the Cloudflare secret

One token serves your entire app — all users' uploads go through your server using this single token.

---

## Optional: custom domain (later)

When you buy a domain:

1. Cloudflare Dashboard → your domain → **DNS**
2. Workers → rolearn → **Settings → Domains & Routes** → add custom domain
3. Update `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` → redeploy

---

## Alternative: Vercel

Still supported. Same env vars work on Vercel — just connect GitHub to Vercel instead. Vercel is simpler to set up but slower on cold starts.

---

## Troubleshooting

**Upload fails** — Check `PUTPUT_TOKEN` is set as an encrypted secret in Cloudflare. Token may have expired (30 days).

**Roblox login fails** — `NEXTAUTH_URL` must exactly match your `*.workers.dev` URL.

**Build fails on Cloudflare — Worker too large** — The free plan has a 3 MB compressed limit. RoLearn uses Prisma Accelerate (`prisma://` URL) to stay under this. Do **not** use a direct `postgresql://` URL as `DATABASE_URL` in production.

**Database errors** — `DATABASE_URL` must be the Prisma Accelerate URL. Use `DIRECT_DATABASE_URL` for `npx prisma db push`.

**PutPut rate limit** — 100 presigns per hour per token. Enough for normal use.

---

## Quick checklist

- [ ] Neon database + Prisma Accelerate enabled
- [ ] `DATABASE_URL` = Accelerate URL, `DIRECT_DATABASE_URL` = Neon URL
- [ ] `npx prisma db push` against production
- [ ] PutPut token generated and saved as `PUTPUT_TOKEN` secret
- [ ] `AUTH_SECRET` + `NEXTAUTH_SECRET` set
- [ ] `NEXT_PUBLIC_APP_URL` + `NEXTAUTH_URL` = your workers.dev URL
- [ ] `OWNER_USERNAMES` = your Roblox username
- [ ] Deployed via GitHub or `npm run deploy:cf`
- [ ] Tested image upload

See also: [CLOUDFLARE.md](./CLOUDFLARE.md) for DNS/R2 details when you get a domain or credit card.
