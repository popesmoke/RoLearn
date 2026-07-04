import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { ButtonLink } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Monetization — RoLearn",
  description:
    "How RoLearn sustains the platform through featured listings, Pro Studio, promoted posts, marketplace commission, and future advertising—while creators keep their earnings.",
};

const legalLinks = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/cookies", label: "Cookie Policy" },
] as const;

const FEATURED_LISTINGS_URL =
  "https://github.com/popesmoke/RoLearn/issues/new?title=Featured%20listing%20inquiry&body=Tell%20us%20about%20your%20listing%20(service%2C%20job%2C%20or%20portfolio)%20and%20how%20you%27d%20like%20it%20featured.";

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
            <strong>site</strong> earns revenue to keep the platform running—not how individual
            creators monetize their Roblox work. Marketplace sellers and service providers{" "}
            <strong>keep their earnings</strong> from client transactions; RoLearn&apos;s fees apply
            only to specific platform features described below.
          </p>

          <section>
            <h2>Featured Listings</h2>
            <p>
              Creators and studios can pay for premium placement of services, job posts, or portfolio
              highlights in discovery surfaces across RoLearn. Featured listings are clearly labeled
              as promoted content and do not imply endorsement by RoLearn.
            </p>
            <p>
              Pricing depends on placement duration, category, and availability. Contact us to
              discuss featured listing options for your offering.
            </p>
          </section>

          <section>
            <h2>Pro Studio Subscription</h2>
            <p>
              Pro Studio is a paid subscription tier for power users who want advanced creator tools:
              expanded analytics, priority support, additional portfolio slots, and enhanced studio
              workflows. Subscription revenue helps fund ongoing development and infrastructure.
            </p>
          </section>

          <section>
            <h2>Promoted Posts</h2>
            <p>
              Users can boost individual feed posts to reach a wider audience on RoLearn. Promoted
              posts appear with a disclosure label and are ranked separately from organic content
              where applicable. This helps creators amplify launches, hiring announcements, or
              portfolio drops.
            </p>
          </section>

          <section>
            <h2>Course Marketplace Commission</h2>
            <p>
              When creators sell courses or educational content through RoLearn&apos;s marketplace,
              RoLearn may charge a platform commission on each sale.{" "}
              <strong>Sellers retain the majority of each sale</strong>; the commission covers
              payment processing, hosting, discovery, and platform maintenance. Exact rates are
              shown at listing or checkout when the course marketplace launches.
            </p>
          </section>

          <section>
            <h2>Future Advertising</h2>
            <p>
              RoLearn may introduce non-intrusive display advertising in the future—such as
              sponsor banners or category sponsorships—to support free access for the broader
              creator community. Any ads will be labeled clearly and kept separate from organic
              listings and user content.
            </p>
          </section>

          <section>
            <h2>What RoLearn Does Not Take</h2>
            <p>
              Direct payments between clients and creators for contract work negotiated on RoLearn are
              between those parties. RoLearn does not take a cut of private gig payments unless a
              specific escrow or checkout feature explicitly states a fee. Our goal is to help
              creators find work—not to intercept their client revenue.
            </p>
          </section>

          <section>
            <h2>Transparency Commitment</h2>
            <p>
              Paid placements and subscriptions are how RoLearn stays independent and
              community-focused. We will update this page as pricing and features evolve. For legal
              terms governing paid features, see our <Link href="/terms">Terms of Service</Link> and{" "}
              <Link href="/disclaimer">Disclaimer</Link>.
            </p>
          </section>

          <div className="!mt-10 rounded-xl border border-accent/30 bg-accent-muted p-6">
            <h2 className="!mb-2 !mt-0 text-lg font-bold text-foreground">
              Interested in a featured listing?
            </h2>
            <p className="!mt-0 text-sm">
              Get premium visibility for your service, job post, or portfolio. Tell us what you want
              to promote and we&apos;ll follow up with placement options and pricing.
            </p>
            <div className="mt-4">
              <ButtonLink href={FEATURED_LISTINGS_URL} size="md">
                Contact about featured listings
              </ButtonLink>
            </div>
          </div>

          <nav
            className="!mt-14 border-t border-border pt-8"
            aria-label="Related legal pages"
          >
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
