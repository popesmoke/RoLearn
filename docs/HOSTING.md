# RoLearn — Deploy on Prisma Compute (recommended)

Run RoLearn with **Prisma Compute + Neon + PutPut**. No credit card required. Your app gets a live `*.prisma.build` URL in **eu-central-1**.

---

## Architecture

```
Users → https://<your-app>.fra.prisma.build  (Prisma Compute)
              ↓
        Neon PostgreSQL  (database)
              ↓
        PutPut  (images, videos, PDFs — no credit card)
```

| Service | Role |
|---|---|
| **Prisma Compute** | Hosts the Next.js app (standalone) |
| **Neon** | PostgreSQL database |
| **PutPut** | File storage (free, no card) |
| **GitHub** | Code + `prisma-cli app deploy` |

---

## Step 1 — Neon database

1. [console.neon.tech](https://console.neon.tech) → project with pooled connection string
2. Apply migrations:

```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

---

## Step 2 — PutPut file storage

```bash
curl -X POST https://putput.io/api/v1/auth/guest
```

Save the `pp_...` token as `PUTPUT_TOKEN` (server secret only).

---

## Step 3 — Deploy to Prisma Compute

### One-time setup

```bash
npx @prisma/cli@latest auth login
```

### Wire env vars on the project

```bash
npx @prisma/cli@latest project env update DATABASE_URL="postgresql://..." --role production --project proj_cmr6n9fbe0emi3mceiypxf126
npx @prisma/cli@latest project env add AUTH_SECRET="..." --role production --project proj_cmr6n9fbe0emi3mceiypxf126
npx @prisma/cli@latest project env add NEXTAUTH_SECRET="..." --role production --project proj_cmr6n9fbe0emi3mceiypxf126
npx @prisma/cli@latest project env add OWNER_USERNAMES="yourrobloxusername" --role production --project proj_cmr6n9fbe0emi3mceiypxf126
npx @prisma/cli@latest project env add PUTPUT_TOKEN="pp_..." --role production --project proj_cmr6n9fbe0emi3mceiypxf126
```

Set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your live `*.prisma.build` URL after the first deploy, then redeploy.

### Deploy to main

```bash
npm run deploy:compute
# or
npx @prisma/cli@latest app deploy --project proj_cmr6n9fbe0emi3mceiypxf126 --branch main --prod --yes
```

Config lives in `prisma.compute.ts` (app name: **rocreators**, framework: **nextjs**).

---

## Local development

```bash
cp .env.example .env
# DATABASE_URL = your Neon pooled URL
npm install
npx prisma migrate deploy
npm run dev
```

---

## Production env vars checklist

- [ ] `DATABASE_URL` — Neon pooled PostgreSQL URL
- [ ] `AUTH_SECRET` + `NEXTAUTH_SECRET`
- [ ] `NEXTAUTH_URL` + `NEXT_PUBLIC_APP_URL` — your `*.prisma.build` URL
- [ ] `OWNER_USERNAMES`
- [ ] `PUTPUT_TOKEN`

---

## Alternative: Cloudflare Workers

Cloudflare Workers free tier has a **3 MB** bundle limit. Prisma Compute avoids that entirely. See git history / `deploy:cf` scripts if you still want Workers + OpenNext.

---

## Troubleshooting

**Roblox login fails** — `NEXTAUTH_URL` must exactly match your live URL.

**Database errors** — confirm `DATABASE_URL` on the Prisma Compute project matches your Neon pooled URL.

**Build fails on Windows** — `prisma.compute.ts` uses `scripts/build-compute.cmd` automatically on Windows.

**Env var changes don't apply** — vars are baked at deploy time; redeploy after updating them.
