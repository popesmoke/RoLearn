# RoLearn

The all-in-one platform for Roblox creators to **learn**, **teach**, **collaborate**, build a reputation, and get hired.

![RoLearn logo](public/logo.png)

## Features

- **Google Login (live now)** — Sign in and access creator dashboard immediately
- **Roblox Identity (planned next)** — Existing user model is ready for Roblox linking/import
- **Trust Levels** — Fair reputation scoring beyond simple verification badges
- **Creator Profiles** — Skills, portfolio, courses, reviews, hire-me status
- **Learning Platform** — Free/paid courses, video lessons, quizzes, certificates, collaborative multi-instructor courses
- **Freelance Marketplace** — Offer services, post jobs, track milestones
- **Team Finder** — Search for scripters, builders, UI designers, and more
- **Portfolio Verification** — Auto-verify Roblox experience and group ownership
- **Community** — Forums, dev logs, showcases, game jams, mentorships

## Tech stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS
- **Prisma** + PostgreSQL ([Neon](https://neon.tech) free tier)
- **Vercel** hosting (free hobby tier)
- **Cloudflare R2** for course media (free 10 GB)
- **Google OAuth** for authentication (temporary until Roblox OAuth verification is approved)

## Getting started

```bash
git clone https://github.com/popesmoke/RoLearn.git
cd RoLearn
npm install
cp .env.example .env
# Add your DATABASE_URL and other secrets to .env
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## MVP app routes

- `/dashboard` — edit profile, add skills, publish portfolio items, courses, services, jobs, and team requests
- `/marketplace` — browse service offers and open jobs
- `/teamfinder` — browse open team recruitment posts

## Deployment

See **[docs/HOSTING.md](docs/HOSTING.md)** for the full free hosting tutorial covering:

- Vercel deployment
- Neon PostgreSQL setup
- Cloudflare R2 file storage
- Google OAuth configuration
- Roblox OAuth migration path
- Upstash Redis, Resend email, and CI/CD

## Project structure

```
RoLearn/
├── docs/HOSTING.md      # Free hosting guide
├── prisma/schema.prisma # Database schema
├── public/logo.png      # Brand assets
└── src/app/             # Next.js pages & API routes
```

## License

MIT
