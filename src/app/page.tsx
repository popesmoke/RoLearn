import Image from "next/image";
import Link from "next/link";
import { AuthButtons, MarketingAuthButtons } from "@/components/auth-buttons";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Icon8, icons } from "@/components/icon8";
import { skillCategories } from "@/lib/constants";
import { formatCategory } from "@/lib/utils";

const highlights = [
  {
    icon: icons.game,
    title: "Roblox-native identity",
    description: "Sign in with your Roblox account — verified through your profile bio. No Google, no passwords.",
  },
  {
    icon: icons.studio,
    title: "Creator studio",
    description: "Manage your profile, portfolio, courses, gigs, and recruitment from one workspace.",
  },
  {
    icon: icons.verified,
    title: "Trust that counts",
    description: "Verified accounts, hire-me status, and reputation — built for how Roblox studios actually work.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="RoLearn" width={36} height={36} className="rounded-xl" />
            <span className="text-lg font-bold tracking-tight">
              Ro<span className="text-accent">Learn</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
            <Link href="/explore" className="transition hover:text-foreground">Discover</Link>
            <Link href="/marketplace" className="transition hover:text-foreground">Market</Link>
            <Link href="/teamfinder" className="transition hover:text-foreground">Teams</Link>
            <Link href="/search" className="transition hover:text-foreground">Search</Link>
          </nav>
          <AuthButtons />
        </div>
      </header>

      <main>
        <section className="hero-gradient border-b border-border">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24">
            <div className="animate-fade-up">
              <Badge variant="accent" className="mb-4">Built for Roblox creators</Badge>
              <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                Where Roblox devs find work, teams, and reputation.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
                Publish your portfolio, apply to gigs, recruit your team, and message creators —
                all verified through your Roblox account.
              </p>
              <div className="mt-8">
                <MarketingAuthButtons />
              </div>
              <p className="mt-4 text-sm text-subtle">
                Free forever · Roblox bio verification · Deploy free on Vercel
              </p>
            </div>

            <div className="animate-fade-up glow-accent rounded-2xl border border-border bg-surface-elevated p-1 [animation-delay:120ms]">
              <div className="rounded-[14px] border border-border bg-surface p-5">
                <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                  <p className="text-sm font-bold">Live feed</p>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="space-y-3">
                  <PreviewPost
                    name="NovaBuilder"
                    handle="novabuilder"
                    tag="Service"
                    title="Advanced lobby systems & matchmaking"
                    meta="Builder · From $120"
                  />
                  <PreviewPost
                    name="ScriptLab"
                    handle="scriptlab"
                    tag="Job"
                    title="Need combat framework for anime RPG"
                    meta="Budget $400 – $800"
                  />
                  <PreviewPost
                    name="PixelForge"
                    handle="pixelforge"
                    tag="Team"
                    title="Recruiting UI designer for tycoon project"
                    meta="UI Designer"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-6 md:grid-cols-3">
              {highlights.map((item) => (
                <div key={item.title} className="surface-panel p-6">
                  <Icon8 name={item.icon} size={36} className="mb-3" />
                  <h2 className="text-lg font-bold">{item.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
            <h2 className="text-2xl font-bold sm:text-3xl">Every role on your team</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted">
              From scripting and building to UI, audio, and monetization — RoLearn is structured around how Roblox studios actually hire.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {skillCategories.map((skill) => (
                <Link key={skill} href={`/search?skill=${skill}`}>
                  <Badge variant="secondary">{formatCategory(skill)}</Badge>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-bold">Start building your presence</h2>
            <p className="mt-3 text-muted">
              Verify with Roblox, publish your first listing, and show up in the feed today.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink href="/explore" size="lg">Explore the feed</ButtonLink>
              <ButtonLink href="/dashboard" variant="outline" size="lg">Open Studio</ButtonLink>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-subtle sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} RoLearn</p>
          <div className="flex gap-4">
            <a href="https://github.com/popesmoke/RoLearn" className="hover:text-foreground">
              GitHub
            </a>
            <a
              href="https://github.com/popesmoke/RoLearn/blob/main/docs/HOSTING.md"
              className="hover:text-foreground"
            >
              Deploy guide
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PreviewPost({
  name,
  handle,
  tag,
  title,
  meta,
}: {
  name: string;
  handle: string;
  tag: string;
  title: string;
  meta: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-elevated/60 p-3">
      <div className="flex items-center gap-2 text-sm">
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-accent to-secondary" />
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-xs text-muted">@{handle}</p>
        </div>
        <Badge className="ml-auto" variant={tag === "Service" ? "accent" : tag === "Job" ? "warning" : "success"}>
          {tag}
        </Badge>
      </div>
      <p className="mt-2 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-muted">{meta}</p>
    </div>
  );
}
