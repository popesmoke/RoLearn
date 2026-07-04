import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";

export const metadata: Metadata = {
  title: "Cookie Policy — RoLearn",
  description:
    "How RoLearn uses cookies and similar technologies on the Roblox creator marketplace.",
};

const LAST_UPDATED = "July 4, 2026";

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie Policy" lastUpdated={LAST_UPDATED} currentPath="/cookies">
      <section>
        <h2>1. What Are Cookies?</h2>
        <p>
          Cookies are small text files stored on your device when you visit a website. Similar
          technologies—such as local storage and session tokens—may serve comparable purposes. This
          policy explains how RoLearn, operated by popesmoke, uses these technologies.
        </p>
      </section>

      <section>
        <h2>2. Why We Use Cookies</h2>
        <p>RoLearn uses cookies and similar technologies to:</p>
        <ul>
          <li>Keep you signed in and maintain secure sessions</li>
          <li>Remember preferences and improve your experience</li>
          <li>Protect against abuse, spam, and unauthorized access</li>
          <li>Understand how features are used so we can improve the product</li>
          <li>Support paid features and billing where applicable</li>
        </ul>
      </section>

      <section>
        <h2>3. Types of Cookies We Use</h2>
        <p>
          <strong>Strictly necessary.</strong> Required for core functionality such as authentication,
          security, and load balancing. RoLearn may not work correctly without these.
        </p>
        <p>
          <strong>Functional.</strong> Remember choices you make, such as UI preferences, to provide a
          more personalized experience.
        </p>
        <p>
          <strong>Analytics.</strong> Help us understand aggregate usage patterns—such as which pages
          are visited and how features perform—so we can improve RoLearn. Where possible, analytics
          data is aggregated and not used to identify you personally.
        </p>
        <p>
          <strong>Third-party.</strong> Some cookies may be set by service providers we use for
          authentication, hosting, analytics, or payments. Those providers are responsible for their
          own cookie practices under their privacy policies.
        </p>
      </section>

      <section>
        <h2>4. Examples of Technologies Used</h2>
        <ul>
          <li>Session cookies for sign-in via authentication providers</li>
          <li>Persistent cookies to keep you logged in across visits (where enabled)</li>
          <li>Local storage for client-side state and performance</li>
          <li>Security tokens to prevent cross-site request forgery and session hijacking</li>
        </ul>
      </section>

      <section>
        <h2>5. Managing Cookies</h2>
        <p>
          Most browsers let you block, delete, or limit cookies through settings. If you disable
          strictly necessary cookies, parts of RoLearn—including sign-in—may not function properly.
        </p>
        <p>
          To manage cookies in common browsers, consult your browser&apos;s help documentation for
          Chrome, Firefox, Safari, or Edge. Mobile device settings may also offer tracking controls.
        </p>
      </section>

      <section>
        <h2>6. Do Not Track</h2>
        <p>
          Some browsers send &quot;Do Not Track&quot; signals. Because there is no consistent industry
          standard, RoLearn does not currently respond to DNT signals in a uniform way. We continue
          to review privacy practices as standards evolve.
        </p>
      </section>

      <section>
        <h2>7. Relationship to Our Privacy Policy</h2>
        <p>
          Cookies may collect information described in our{" "}
          <a href="/privacy">Privacy Policy</a>. For broader questions about how we handle personal
          data, please refer to that document.
        </p>
      </section>

      <section>
        <h2>8. Changes to This Policy</h2>
        <p>
          We may update this Cookie Policy from time to time. Changes will be posted on this page
          with an updated &quot;Last updated&quot; date.
        </p>
      </section>

      <section>
        <h2>9. Contact</h2>
        <p>
          Questions about cookies may be directed to RoLearn (popesmoke) via{" "}
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
