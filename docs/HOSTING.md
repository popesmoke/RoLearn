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

## Step 1 — Neon database

1. [console.neon.tech](https://console.neon.tech) → new project `rolearn`
2. Copy the **pooled** connection string
3. Locally: `npx prisma db push`

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
| Framework | Next.js (or custom) |
| Build command | `npm run deploy:cf` |
| Or split | Build: `npx opennextjs-cloudflare build` / Deploy: `npx wrangler deploy` |

4. Add **environment variables** (Settings → Variables):

| Variable | Type | Value |
|---|---|---|
| `DATABASE_URL` | Encrypted | Neon pooled URL |
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

**Build fails on Cloudflare** — Worker free plan has a 3 MB compressed size limit. If you hit this, upgrade to Workers Paid ($5/mo) for 10 MB.

**Database errors** — Use Neon's **pooled** URL with `?sslmode=require`.

**PutPut rate limit** — 100 presigns per hour per token. Enough for normal use.

---

## Quick checklist

- [ ] Neon database + `DATABASE_URL` secret
- [ ] `npx prisma db push` against production
- [ ] PutPut token generated and saved as `PUTPUT_TOKEN` secret
- [ ] `AUTH_SECRET` + `NEXTAUTH_SECRET` set
- [ ] `NEXT_PUBLIC_APP_URL` + `NEXTAUTH_URL` = your workers.dev URL
- [ ] `OWNER_USERNAMES` = your Roblox username
- [ ] Deployed via GitHub or `npm run deploy:cf`
- [ ] Tested image upload

See also: [CLOUDFLARE.md](./CLOUDFLARE.md) for DNS/R2 details when you get a domain or credit card.
