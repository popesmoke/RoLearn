import Image from "next/image";
import { AuthButtons } from "@/components/auth-buttons";

const features = [
  {
    title: "Roblox Identity",
    description:
      "Google sign-in now, Roblox sign-in next. User profiles are already structured for Roblox identity import.",
  },
  {
    title: "Verified Portfolios",
    description:
      "Connect experiences and groups — ownership verified automatically. No more fake portfolios.",
  },
  {
    title: "Collaborative Courses",
    description:
      "Multiple instructors per course with automatic revenue splits. Builder, scripter, and UI designer teach together.",
  },
  {
    title: "Team Finder",
    description:
      "Search for scripters, builders, UI designers, and animators. Apply directly to join game projects.",
  },
  {
    title: "Freelance Marketplace",
    description:
      "Offer services, post jobs, set budgets, track milestones, and build reputation through completed work.",
  },
  {
    title: "Trust Score",
    description:
      "Fair reputation from reviews, completed jobs, courses, portfolio quality, and community contributions.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050508] text-zinc-100">
      <header className="border-b border-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="RoLearn"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-xl font-bold">
              <span className="gradient-text">Ro</span>
              <span>Learn</span>
            </span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-zinc-400 sm:flex">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a
              href="https://github.com/popesmoke/RoLearn/blob/main/docs/HOSTING.md"
              className="hover:text-white transition-colors"
            >
              Hosting Guide
            </a>
          </nav>
          <AuthButtons />
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 py-24 text-center">
          <div className="mx-auto mb-8 inline-block hex-glow rounded-2xl">
            <Image
              src="/logo.png"
              alt="RoLearn logo"
              width={160}
              height={160}
              className="rounded-2xl"
              priority
            />
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            The all-in-one platform for{" "}
            <span className="gradient-text">Roblox creators</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
            Learn, teach, collaborate, build a reputation, and get hired — all in
            one place. No more jumping between YouTube, Discord, and talent
            marketplaces.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-500">
            Temporary auth: Google OAuth (free). Roblox OAuth will be enabled
            once account verification is approved.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button className="rounded-full bg-rolearn-blue px-8 py-3 font-medium text-white transition hover:bg-blue-500">
              Get Started — Free
            </button>
            <a
              href="https://github.com/popesmoke/RoLearn/blob/main/docs/HOSTING.md"
              className="rounded-full border border-white/10 px-8 py-3 font-medium text-zinc-300 transition hover:border-white/20 hover:text-white"
            >
              Deploy Guide
            </a>
          </div>
        </section>

        <section id="features" className="border-t border-white/5 bg-white/[0.02] py-24">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-3xl font-bold">
              Everything creators need
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-zinc-400">
              Verified portfolios, team finding, and collaborative courses —
              features that make RoLearn genuinely unique.
            </p>
            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition hover:border-blue-500/20 hover:bg-white/[0.04]"
                >
                  <h3 className="text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <h2 className="text-3xl font-bold">Skill categories</h2>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {[
                "Scripter",
                "Builder",
                "UI Designer",
                "Animator",
                "Modeler",
                "VFX Artist",
                "Sound Designer",
                "Composer",
                "Game Designer",
                "Monetization",
                "Community Manager",
              ].map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-zinc-500">
          <p>RoLearn — Built for the Roblox creator ecosystem.</p>
          <p className="mt-2">
            <a
              href="https://github.com/popesmoke/RoLearn"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              View on GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
