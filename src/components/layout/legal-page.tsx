import Link from "next/link";
import Image from "next/image";

const legalLinks = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/cookies", label: "Cookie Policy" },
  { href: "/monetization", label: "Monetization" },
] as const;

type LegalPageProps = {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
  currentPath?: string;
};

export function LegalPage({ title, lastUpdated, children, currentPath }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface/50">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-xl transition hover:opacity-80"
          >
            <Image src="/logo.png" alt="RoLearn" width={36} height={36} className="rounded-xl" />
            <span className="text-lg font-bold tracking-tight">
              Ro<span className="text-accent">Learn</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-10 border-b border-border pb-8">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-subtle">Last updated: {lastUpdated}</p>
        </header>

        <article className="legal-prose">{children}</article>

        <nav
          className="mt-14 border-t border-border pt-8"
          aria-label="Related legal pages"
        >
          <p className="mb-4 text-sm font-semibold text-muted">Related pages</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {legalLinks.map((link) => (
              <li key={link.href}>
                {link.href === currentPath ? (
                  <span className="text-subtle">{link.label}</span>
                ) : (
                  <Link href={link.href} className="text-accent hover:text-accent-hover">
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </div>
  );
}
