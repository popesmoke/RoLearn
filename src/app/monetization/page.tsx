import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Monetization — RoLearn",
  description:
    "How RoLearn sustains the platform through Pro Studio subscriptions and course sales—while job payments stay between creators and clients.",
};

const legalLinks = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/cookies", label: "Cookie Policy" },
] as const;

export default function MonetizationPage() {
  return (
    <AppShell
      title="Monetization"
      subtitle="How RoLearn sustains the platform"
      showRightRail={false}
    >
      <div className="px-4 py-6 sm:px-6">
        <article className="legal-prose mx-auto max-w-2xl">
          <p className="!mt-0 text-base text-foreground">
            RoLearn is built and operated by <strong>popesmoke</strong>. This page explains how the{" "}
            <strong>platform</strong> earns revenue—not how individual creators get paid by clients.
          </p>

          <section>
            <h2>Job &amp; service payments — no platform cut</h2>
            <p>
              When a client hires a scripter or pays for a build, <strong>that money goes directly
              between you and the client</strong> — through Robux, PayPal, or whatever you agree on.
              RoLearn does not process those payments and does not take a percentage. We help you find
              work and build trust; you handle the transaction yourself.
            </p>
          </section>

          <section>
            <h2>Pro Studio subscription</h2>
            <p>
              Pro Studio is a monthly subscription for creators who want more visibility and tools.
              Planned benefits include:
            </p>
            <ul>
              <li>
                <strong>Featured listings included</strong> — your services, jobs, or team posts get
                promoted placement in the feed and search (normally a separate paid add-on)
              </li>
              <li>
                <strong>Extra portfolio slots</strong> — show more projects with images on your profile
              </li>
              <li>
                <strong>Advanced analytics</strong> — profile views, post performance, hire requests
              </li>
              <li>
                <strong>Priority in search</strong> — higher placement when clients look for talent
              </li>
              <li>
                <strong>Pro badge</strong> on your profile
              </li>
            </ul>
            <p>
              Subscriptions fund servers, storage, and development. Pricing will be announced when
              Pro Studio launches.
            </p>
          </section>

          <section>
            <h2>Featured listings (à la carte)</h2>
            <p>
              Don&apos;t want a subscription? You can still pay to feature a single service, job, or
              team post for a set number of days. Featured posts are labeled as promoted. Pro Studio
              members get a monthly featured slot included.
            </p>
          </section>

          <section>
            <h2>Course marketplace commission</h2>
            <p>
              Unlike jobs, <strong>courses are sold through RoLearn</strong> (written guides, PDFs,
              tutorials hosted on the platform). When paid course checkout launches, RoLearn takes a
              small commission on each sale — similar to Udemy or Gumroad. Sellers keep the majority;
              the fee covers hosting, discovery, and payment processing. Free courses have no fee.
            </p>
          </section>

          <section>
            <h2>Future: promoted posts &amp; ads</h2>
            <p>
              Individual feed boosts and light sponsor banners may be added later. Anything paid will
              be clearly labeled so organic content stays trustworthy.
            </p>
          </section>

          <section>
            <h2>Summary</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2 pr-4">Activity</th>
                    <th className="py-2">RoLearn fee?</th>
                  </tr>
                </thead>
                <tbody className="text-muted">
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4">Hiring / freelance jobs</td>
                    <td className="py-2">No — you pay each other directly</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4">Selling a service listing</td>
                    <td className="py-2">No — listing is free</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4">Featured listing</td>
                    <td className="py-2">Yes — optional paid boost</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4">Pro Studio subscription</td>
                    <td className="py-2">Yes — includes featured slots + perks</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Paid courses (future)</td>
                    <td className="py-2">Yes — small commission on sales</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <div className="!mt-10 rounded-xl border border-accent/30 bg-accent-muted p-6">
            <h2 className="!mb-2 !mt-0 text-lg font-bold text-foreground">
              Want featured placement?
            </h2>
            <p className="!mt-0 text-sm">
              Pro Studio will include featured listings. Until it launches, contact us for early
              placement options.
            </p>
            <div className="mt-4">
              <ButtonLink href="/dashboard?tab=analytics" size="md">
                Go to Studio
              </ButtonLink>
            </div>
          </div>

          <nav className="!mt-14 border-t border-border pt-8" aria-label="Related legal pages">
            <p className="mb-4 text-sm font-semibold text-muted">Related pages</p>
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-accent hover:text-accent-hover">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <span className="text-subtle">Monetization</span>
              </li>
            </ul>
          </nav>
        </article>
      </div>
    </AppShell>
  );
}
