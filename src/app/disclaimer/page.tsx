import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";

export const metadata: Metadata = {
  title: "Disclaimer — RoLearn",
  description:
    "Important disclaimers about RoLearn, including non-affiliation with Roblox Corporation, user-generated content, and payment guarantees.",
};

const LAST_UPDATED = "July 4, 2026";

export default function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer" lastUpdated={LAST_UPDATED} currentPath="/disclaimer">
      <section>
        <h2>1. General Information</h2>
        <p>
          The information and services provided on RoLearn are offered for general informational and
          professional networking purposes. RoLearn is operated by popesmoke. By using this site, you
          acknowledge and agree to the disclaimers below.
        </p>
      </section>

      <section>
        <h2>2. No Affiliation with Roblox Corporation</h2>
        <p>
          RoLearn is an independent platform created for Roblox creators. RoLearn is{" "}
          <strong>not affiliated with, endorsed by, sponsored by, or officially connected to</strong>{" "}
          Roblox Corporation or any of its subsidiaries or affiliates.
        </p>
        <p>
          Roblox® is a registered trademark of Roblox Corporation. All other trademarks, service
          marks, and trade names referenced on RoLearn belong to their respective owners. References
          to Roblox, its platform, or its community are for descriptive purposes only.
        </p>
      </section>

      <section>
        <h2>3. User-Generated Content</h2>
        <p>
          Much of the content on RoLearn—including profiles, portfolio work, service descriptions,
          job posts, messages, reviews, and uploaded media—is created and published by users, not by
          RoLearn.
        </p>
        <p>
          RoLearn does not guarantee the accuracy, completeness, legality, or quality of
          user-generated content. Opinions expressed by users are their own and do not represent
          RoLearn&apos;s views. You should exercise independent judgment before hiring, purchasing,
          collaborating with, or relying on any user or listing.
        </p>
        <p>
          If you believe content infringes your rights or violates our policies, please report it
          through available platform tools or contact us.
        </p>
      </section>

      <section>
        <h2>4. No Payment or Transaction Guarantees</h2>
        <p>
          RoLearn may help creators discover work and connect with clients, but{" "}
          <strong>we do not guarantee payments, refunds, project completion, or dispute resolution</strong>{" "}
          between users unless a specific RoLearn feature explicitly states otherwise.
        </p>
        <p>
          Any financial arrangement between buyers and sellers is at their own risk. RoLearn is not
          responsible for chargebacks, non-payment, fraud, scope disagreements, or damages arising
          from off-platform or on-platform transactions between users.
        </p>
      </section>

      <section>
        <h2>5. No Professional Advice</h2>
        <p>
          Content on RoLearn—including tutorials, course listings, and community posts—does not
          constitute legal, financial, tax, or professional advice. Consult qualified professionals
          before making business or compliance decisions related to Roblox development or
          monetization.
        </p>
      </section>

      <section>
        <h2>6. Promoted and Featured Listings</h2>
        <p>
          Paid featured listings, promoted posts, and similar placements are advertising products.
          Promotion does not mean RoLearn verifies, endorses, or guarantees the quality, safety, or
          legitimacy of any promoted user or offering. See our{" "}
          <a href="/monetization">Monetization</a> page for how paid placements work.
        </p>
      </section>

      <section>
        <h2>7. Service Availability</h2>
        <p>
          RoLearn is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We do not
          warrant uninterrupted access, error-free operation, or that the platform will meet your
          specific requirements. Maintenance, outages, and third-party dependencies may affect
          availability.
        </p>
      </section>

      <section>
        <h2>8. External Links</h2>
        <p>
          RoLearn may contain links to third-party websites, Discord servers, payment processors, or
          Roblox experiences. We are not responsible for the content, policies, or practices of
          third-party sites. Accessing external links is at your own risk.
        </p>
      </section>

      <section>
        <h2>9. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by applicable law, RoLearn and popesmoke disclaim liability
          for any direct, indirect, incidental, consequential, or punitive damages arising from your
          use of the platform, reliance on user content, or interactions with other users.
        </p>
      </section>

      <section>
        <h2>10. Contact</h2>
        <p>
          Questions about this Disclaimer may be directed to RoLearn (popesmoke) via{" "}
          <a
            href="https://github.com/popesmoke/RoLearn/issues"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub Issues
          </a>{" "}
          on the RoLearn repository.
        </p>
      </section>
    </LegalPage>
  );
}
