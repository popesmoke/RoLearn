import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service — RoLearn",
  description:
    "Terms of Service for RoLearn, the professional network and marketplace for Roblox creators.",
};

const LAST_UPDATED = "July 4, 2026";

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" lastUpdated={LAST_UPDATED} currentPath="/terms">
      <section>
        <h2>1. Agreement to Terms</h2>
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your access to and use of RoLearn
          (&quot;RoLearn,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), operated by
          popesmoke. By creating an account, browsing, posting, or transacting on RoLearn, you agree
          to these Terms. If you do not agree, do not use the platform.
        </p>
      </section>

      <section>
        <h2>2. Eligibility</h2>
        <p>
          You must be at least 13 years old to use RoLearn. If you are under 18, you represent that
          you have permission from a parent or legal guardian. You are responsible for ensuring that
          your use of RoLearn complies with applicable laws, Roblox&apos;s terms, and any agreements
          you have with third parties.
        </p>
      </section>

      <section>
        <h2>3. The RoLearn Platform</h2>
        <p>
          RoLearn is a creator marketplace and professional network for the Roblox ecosystem. We
          provide tools to publish work, discover creators, post services and jobs, message other
          users, and build reputation. RoLearn is an independent service and is not affiliated with,
          endorsed by, or sponsored by Roblox Corporation.
        </p>
      </section>

      <section>
        <h2>4. Accounts and Security</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account credentials and
          for all activity under your account. You agree to provide accurate profile information and
          to notify us promptly of any unauthorized use. We may suspend or terminate accounts that
          violate these Terms or pose a risk to the community.
        </p>
      </section>

      <section>
        <h2>5. User Content</h2>
        <p>
          You retain ownership of content you post on RoLearn, including portfolio items, service
          listings, job posts, messages, and media (&quot;User Content&quot;). By posting User
          Content, you grant RoLearn a non-exclusive, worldwide, royalty-free license to host,
          display, and distribute that content solely to operate and promote the platform.
        </p>
        <p>
          You represent that you have the rights to post your User Content and that it does not
          infringe third-party rights or violate applicable law. We may remove content that violates
          these Terms or that we reasonably believe is harmful, fraudulent, or misleading.
        </p>
      </section>

      <section>
        <h2>6. Marketplace Transactions</h2>
        <p>
          RoLearn may facilitate connections between buyers and sellers of creator services, courses,
          and other offerings. Unless explicitly stated otherwise, RoLearn is not a party to
          agreements between users. Payment terms, deliverables, refunds, and disputes are handled
          directly between the parties unless a specific RoLearn feature provides otherwise.
        </p>
        <p>
          Sellers are responsible for their own tax obligations, pricing, and fulfillment. RoLearn
          does not guarantee payment, delivery, quality, or outcomes of any transaction between
          users.
        </p>
      </section>

      <section>
        <h2>7. Prohibited Conduct</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use RoLearn for fraud, scams, harassment, or illegal activity</li>
          <li>Impersonate Roblox Corporation, RoLearn staff, or other users</li>
          <li>Upload malware, spam, or content that exploits minors</li>
          <li>Circumvent platform fees, security measures, or access controls</li>
          <li>Scrape or automate access in ways that harm service stability</li>
          <li>Post misleading portfolio work or false credentials</li>
        </ul>
      </section>

      <section>
        <h2>8. Paid Features and Promotions</h2>
        <p>
          RoLearn may offer paid products such as featured listings, promoted posts, subscriptions,
          and marketplace tools. Fees, billing cycles, and eligibility are described at purchase or
          on our <a href="/monetization">Monetization</a> page. Paid placements are promotional
          only and do not constitute endorsements of any seller or listing.
        </p>
      </section>

      <section>
        <h2>9. Intellectual Property</h2>
        <p>
          RoLearn&apos;s name, logo, software, and site design are owned by RoLearn or its licensors.
          You may not copy, modify, or reverse engineer our platform except as permitted by law.
          Roblox® is a registered trademark of Roblox Corporation. RoLearn is not affiliated with
          Roblox Corporation.
        </p>
      </section>

      <section>
        <h2>10. Disclaimers and Limitation of Liability</h2>
        <p>
          RoLearn is provided &quot;as is&quot; and &quot;as available.&quot; To the fullest extent
          permitted by law, RoLearn disclaims warranties of merchantability, fitness for a
          particular purpose, and non-infringement. See our <a href="/disclaimer">Disclaimer</a> for
          additional details.
        </p>
        <p>
          To the maximum extent permitted by law, RoLearn and popesmoke will not be liable for
          indirect, incidental, special, consequential, or punitive damages, or for lost profits,
          data, or goodwill arising from your use of the platform.
        </p>
      </section>

      <section>
        <h2>11. Termination</h2>
        <p>
          You may stop using RoLearn at any time. We may suspend or terminate access if you breach
          these Terms or if required for legal, security, or operational reasons. Sections that by
          their nature should survive termination will remain in effect.
        </p>
      </section>

      <section>
        <h2>12. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. Material changes will be posted on this page
          with an updated &quot;Last updated&quot; date. Continued use after changes constitutes
          acceptance of the revised Terms.
        </p>
      </section>

      <section>
        <h2>13. Contact</h2>
        <p>
          Questions about these Terms may be directed to RoLearn (popesmoke) via{" "}
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
