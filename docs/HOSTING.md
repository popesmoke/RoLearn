# RoLearn - Full Free Hosting Tutorial (Google Login Now, Roblox Later)

This is the complete free setup for launching RoLearn today.

- Auth now: **Google OAuth** (free and quick to ship)
- Auth later: **Roblox OAuth** (after Roblox verification is approved)
- Hosting: **Vercel**
- Database: **Neon PostgreSQL**
- Optional storage/cache/email: **Cloudflare R2**, **Upstash**, **Resend**

## 1) Free stack (recommended)

| Service | Use | Free tier |
|---|---|---|
| [Vercel](https://vercel.com) | Next.js hosting + API routes | Hobby plan |
| [Neon](https://neon.tech) | PostgreSQL database | 512 MB |
| [Google Cloud OAuth](https://console.cloud.google.com/) | Login provider | Free |
| [GitHub](https://github.com) | Repo + CI | Free |
| [Cloudflare R2](https://www.cloudflare.com/products/r2/) | Media uploads | 10 GB |
| [Upstash](https://upstash.com) | Redis/rate-limit | 10K commands/day |
| [Resend](https://resend.com) | Transactional email | 100/day |

## 2) Clone and run locally

```bash
git clone https://github.com/popesmoke/RoLearn.git
cd RoLearn
npm install
cp .env.example .env
```

Fill `.env` with at least:

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="generate_with_openssl"
NEXTAUTH_SECRET="same_as_auth_secret_or_another_secure_value"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
```

Generate secret:

```bash
openssl rand -base64 32
```

## 3) Create free Neon database

1. Go to [Neon Console](https://console.neon.tech)
2. Create project: `rolearn`
3. Copy pooled connection string
4. Put it in `DATABASE_URL`

Then run:

```bash
npx prisma db push
```

## 4) Configure Google OAuth (required)

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Go to **APIs & Services -> OAuth consent screen**
4. Configure app (External is fine for startup/testing)
5. Add test users if app is in testing mode
6. Go to **Credentials -> Create Credentials -> OAuth client ID**
7. App type: **Web application**

Add Authorized redirect URIs:

- Local: `http://localhost:3000/api/auth/callback/google`
- Prod: `https://YOUR_APP.vercel.app/api/auth/callback/google`

Copy values into env:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## 5) Start local app

```bash
npm run dev
```

Open `http://localhost:3000` and click **Sign in with Google**.

## 6) Deploy to Vercel (free)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Import `RoLearn` repo from GitHub
3. Add environment variables:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon pooled URL |
| `AUTH_SECRET` | Output of `openssl rand -base64 32` |
| `NEXTAUTH_SECRET` | Same secure random value (recommended) |
| `GOOGLE_CLIENT_ID` | From Google OAuth client |
| `GOOGLE_CLIENT_SECRET` | From Google OAuth client |
| `NEXT_PUBLIC_APP_URL` | `https://YOUR_APP.vercel.app` |
| `NEXTAUTH_URL` | `https://YOUR_APP.vercel.app` |

4. Deploy

After first deploy, update Google OAuth redirect URI with the exact Vercel URL if needed.

## 7) GitHub push workflow

```bash
git add .
git commit -m "Add Google auth and update free hosting tutorial"
git push
```

Vercel will auto-deploy on push.

## 8) Optional free add-ons

### Cloudflare R2 (course videos/files)

Set:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_URL`

### Upstash (rate limits/caching)

Set:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

### Resend (emails)

Set:

- `RESEND_API_KEY`

## 9) Roblox OAuth later (when verification passes)

Keep these vars ready for future migration:

- `ROBLOX_CLIENT_ID`
- `ROBLOX_CLIENT_SECRET`
- `ROBLOX_REDIRECT_URI`

Recommended migration plan:

1. Keep Google login active
2. Add Roblox as second provider
3. Let users link Roblox account in profile settings
4. Gradually make Roblox identity the primary profile signal

## 10) Troubleshooting

**Google login shows redirect URI mismatch**
- Check URI is exact (scheme, domain, path, no extra slash)

**Build succeeds but auth fails in production**
- Recheck Vercel env vars and redeploy

**Database errors on deploy**
- Verify `DATABASE_URL` is pooled Neon URL

**Missing secret error**
- Ensure `AUTH_SECRET` exists in local `.env` and Vercel env

## 11) Reality check on "100% free"

You can run fully free at early stage. As usage grows, you may outgrow free limits, but this setup is the most practical no-cost launch path.
