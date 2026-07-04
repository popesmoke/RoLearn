import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy — RoLearn",
  description:
    "How RoLearn collects, uses, and protects your personal information on the Roblox creator marketplace.",
};

const LAST_UPDATED = "July 4, 2026";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated={LAST_UPDATED} currentPath="/privacy">
      <section>
        <h2>1. Introduction</h2>
        <p>
          RoLearn (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), operated by popesmoke,
          respects your privacy. This Privacy Policy explains what information we collect when you
          use RoLearn, how we use it, and the choices available to you.
        </p>
      </section>

      <section>
        <h2>2. Information We Collect</h2>
        <p>We may collect the following categories of information:</p>
        <ul>
          <li>
            <strong>Account information:</strong> username, display name, email address, profile
            details, and authentication identifiers from sign-in providers you choose to use
          </li>
          <li>
            <strong>Roblox-related information:</strong> Roblox username or public profile details
            you choose to display on your RoLearn profile
          </li>
          <li>
            <strong>Content you provide:</strong> posts, portfolio items, service listings, job
            posts, messages, uploads, and other User Content
          </li>
          <li>
            <strong>Usage data:</strong> pages viewed, features used, interactions (such as likes and
            notifications), and approximate device or browser information
          </li>
          <li>
            <strong>Technical data:</strong> IP address, cookies, session tokens, and logs needed
            for security and service operation
          </li>
          <li>
            <strong>Payment-related metadata:</strong> if you purchase paid features, we may receive
            transaction identifiers and billing status from our payment processors (we do not store
            full payment card numbers on RoLearn servers)
          </li>
        </ul>
      </section>

      <section>
        <h2>3. How We Use Information</h2>
        <p>We use collected information to:</p>
        <ul>
          <li>Provide, maintain, and improve RoLearn</li>
          <li>Authenticate users and secure accounts</li>
          <li>Display profiles, listings, and communications you initiate</li>
          <li>Send service-related notifications and respond to support requests</li>
          <li>Enforce our Terms, prevent abuse, and protect the community</li>
          <li>Analyze aggregate usage to improve product experience</li>
          <li>Process payments for RoLearn features you purchase</li>
        </ul>
      </section>

      <section>
        <h2>4. How We Share Information</h2>
        <p>
          <strong>Public profile and listings.</strong> Information you publish on RoLearn—such as
          your username, portfolio, and marketplace listings—is visible to other users and may be
          indexed by search engines.
        </p>
        <p>
          <strong>Service providers.</strong> We may share data with hosting, storage, analytics,
          authentication, and payment vendors who process information on our behalf under
          contractual obligations.
        </p>
        <p>
          <strong>Legal and safety.</strong> We may disclose information if required by law, to
          protect rights and safety, or to investigate fraud or abuse.
        </p>
        <p>We do not sell your personal information.</p>
      </section>

      <section>
        <h2>5. Cookies and Similar Technologies</h2>
        <p>
          RoLearn uses cookies and similar technologies for authentication, preferences, and
          analytics. For details, see our <a href="/cookies">Cookie Policy</a>.
        </p>
      </section>

      <section>
        <h2>6. Data Retention</h2>
        <p>
          We retain information for as long as needed to provide the service, comply with legal
          obligations, resolve disputes, and enforce agreements. You may request deletion of your
          account subject to legal and operational requirements.
        </p>
      </section>

      <section>
        <h2>7. Security</h2>
        <p>
          We implement reasonable technical and organizational measures to protect your information.
          No method of transmission or storage is completely secure; you use RoLearn at your own
          risk and should protect your account credentials.
        </p>
      </section>

      <section>
        <h2>8. Children&apos;s Privacy</h2>
        <p>
          RoLearn is not directed to children under 13. We do not knowingly collect personal
          information from children under 13. If you believe a child has provided us personal
          information, contact us and we will take appropriate steps to remove it.
        </p>
      </section>

      <section>
        <h2>9. Your Rights and Choices</h2>
        <p>
          Depending on your location, you may have rights to access, correct, delete, or export
          personal data, or to object to certain processing. You can update much of your profile
          information directly in RoLearn settings. For other requests, contact us using the details
          below.
        </p>
      </section>

      <section>
        <h2>10. International Users</h2>
        <p>
          RoLearn may process and store information in countries other than your own. By using the
          service, you consent to such transfers subject to applicable safeguards.
        </p>
      </section>

      <section>
        <h2>11. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date at
          the top of this page reflects the most recent revision. Material changes will be posted
          here.
        </p>
      </section>

      <section>
        <h2>12. Contact</h2>
        <p>
          Privacy questions may be directed to RoLearn (popesmoke) via{" "}
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
