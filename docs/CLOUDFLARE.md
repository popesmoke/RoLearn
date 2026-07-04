# Cloudflare Setup for RoLearn (optional)

> **Don't have a credit card?** Skip this doc. Use **[Supabase Storage](./HOSTING.md#step-2--supabase-file-storage-10-min-no-credit-card)** instead — free, no card required. Cloudflare R2 asks for a payment method even on the free tier.

Cloudflare is **optional**. You only need it if you want:
- **R2** file storage (10 GB free, but credit card required)
- **Custom domain DNS** (when you buy a domain later)

For Vercel-only hosting with `your-app.vercel.app`, see **[HOSTING.md](./HOSTING.md)**.

---

## Part 1: Cloudflare R2 (file storage)

Required for photos, videos, and PDFs in production on Vercel.

### Step 1 — Create a Cloudflare account

1. Go to [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
2. Sign up (free)

### Step 2 — Create an R2 bucket

1. In the left sidebar, click **R2 Object Storage**
2. Click **Create bucket**
3. Name it `rolearn-uploads` (or any name — match `R2_BUCKET_NAME` in env)
4. Choose a location close to your users (e.g. Western Europe or US East)
5. Click **Create bucket**

### Step 3 — Enable public access

1. Open your bucket → **Settings**
2. Under **Public access**, click **Allow Access** or **Connect Domain**
3. Option A — **R2.dev subdomain** (easiest):
   - Click **Allow Access** on the r2.dev subdomain
   - Copy the public URL (e.g. `https://pub-abc123.r2.dev`)
   - This becomes your `R2_PUBLIC_URL`
4. Option B — **Custom domain** (optional later):
   - Add a subdomain like `media.yoursite.com` in bucket settings

### Step 4 — Create API tokens

1. In R2 overview, click **Manage R2 API Tokens**
2. Click **Create API token**
3. Permissions: **Object Read & Write**
4. Scope: apply to your `rolearn-uploads` bucket
5. Click **Create**
6. Copy:
   - **Access Key ID** → `R2_ACCESS_KEY_ID`
   - **Secret Access Key** → `R2_SECRET_ACCESS_KEY`
7. Your **Account ID** is on the R2 overview page (right sidebar) → `R2_ACCOUNT_ID`

### Step 5 — Add to Vercel

In Vercel → Project → Settings → Environment Variables:

```env
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key"
R2_SECRET_ACCESS_KEY="your-secret-key"
R2_BUCKET_NAME="rolearn-uploads"
R2_PUBLIC_URL="https://pub-abc123.r2.dev"
```

Redeploy after saving.

### Step 6 — Test uploads

1. Sign in to RoLearn
2. Go to Studio → Portfolio → upload an image
3. Or Create post → add a photo
4. If it fails, check Vercel logs and confirm all 5 R2 variables are set

---

## Part 2: Cloudflare DNS (custom domain)

Use this when you have a domain (e.g. `rolearn.com`) and want it pointing to Vercel.

### Step 1 — Add your site to Cloudflare

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Add a site**
2. Enter your domain → choose **Free** plan
3. Cloudflare scans existing DNS records

### Step 2 — Update nameservers

1. Cloudflare shows two nameservers (e.g. `ada.ns.cloudflare.com`)
2. Go to your domain registrar (Namecheap, GoDaddy, etc.)
3. Replace nameservers with Cloudflare's
4. Wait up to 24 hours (usually minutes)

### Step 3 — Add DNS records for Vercel

1. In Cloudflare → your domain → **DNS** → **Records**
2. Add a record for the root domain:
   - **Type:** `CNAME`
   - **Name:** `@` (or use an A record if Vercel provides an IP)
   - **Target:** `cname.vercel-dns.com` (Vercel shows the exact value in Project → Settings → Domains)
   - **Proxy status:** Proxied (orange cloud) — gives you CDN + DDoS protection
3. For `www`:
   - **Type:** `CNAME`
   - **Name:** `www`
   - **Target:** `cname.vercel-dns.com`

### Step 4 — Connect domain in Vercel

1. Vercel → your project → **Settings** → **Domains**
2. Add `yoursite.com` and `www.yoursite.com`
3. Vercel verifies DNS automatically

### Step 5 — Update RoLearn env vars

```env
NEXT_PUBLIC_APP_URL="https://yoursite.com"
NEXTAUTH_URL="https://yoursite.com"
```

Redeploy.

### SSL

Cloudflare provides free SSL. In **SSL/TLS** → set mode to **Full** (not Flexible) when using Vercel.

---

## What goes where — quick reference

| Thing | Where it lives |
|---|---|
| Website code & pages | **Vercel** |
| Database | **Neon** (PostgreSQL) |
| Images, videos, PDFs | **Cloudflare R2** |
| Domain DNS & CDN | **Cloudflare** |
| Source code | **GitHub** |

---

## Free tier limits

| R2 | Free |
|---|---|
| Storage | 10 GB/month |
| Class A operations (writes) | 1 million/month |
| Class B operations (reads) | 10 million/month |
| Egress to internet | Free |

| DNS (Cloudflare) | Free |
|---|---|
| DNS queries | Unlimited |
| CDN proxy | Unlimited |
| SSL | Free |

This is more than enough to launch RoLearn.

---

## Alternative: always-on hosting

Vercel Hobby can feel slow on the first click after idle (cold start). If that bothers you:

| Platform | Notes |
|---|---|
| **[Railway](https://railway.app)** | Always-on Docker, uses repo `Dockerfile` |
| **[Render](https://render.com)** | Web Service (not Static Site) |

Same Neon + Supabase stack works on any host.

---

## Local development without R2

On your computer, uploads save to `public/uploads/` automatically. R2 is only required in production (Vercel).

See also: [HOSTING.md](./HOSTING.md) for the full Vercel + Neon deploy guide.
