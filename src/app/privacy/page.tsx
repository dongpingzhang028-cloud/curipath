import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — CuriPath",
  description: "How CuriPath collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated August 2026.</p>

      <div className="mt-8 flex flex-col gap-8 text-sm leading-relaxed text-slate-700">
        <section>
          <h2 className="text-lg font-bold text-slate-900">Overview</h2>
          <p className="mt-2">
            CuriPath helps parents discover and compare kids&apos; classes and activities. This
            page explains what information we collect when you use CuriPath, how we use it, and
            who we share it with.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900">Information we collect</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              <span className="font-medium text-slate-900">Account information</span> — your name,
              email address, and a securely hashed version of your password (we never store your
              password in plain text).
            </li>
            <li>
              <span className="font-medium text-slate-900">Children&apos;s information</span> —
              first name and birth year for any children you add to your account, so we can show
              age-appropriate programs.
            </li>
            <li>
              <span className="font-medium text-slate-900">Usage information</span> — which
              programs you save or mark as enrolled, so your dashboard can show them back to you.
            </li>
          </ul>
          <p className="mt-2">
            We do not collect payment information — CuriPath doesn&apos;t process bookings or
            payments directly; the &quot;Book class&quot; button takes you to the provider&apos;s
            own site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900">How we use your information</h2>
          <p className="mt-2">We use the information above only to operate CuriPath itself:</p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>Creating and signing you into your account.</li>
            <li>Showing you programs matched to your children&apos;s ages.</li>
            <li>Remembering your saved and enrolled programs.</li>
            <li>Emailing you a password reset link when you request one.</li>
          </ul>
          <p className="mt-2">
            We don&apos;t sell your information, and we don&apos;t run any advertising on
            CuriPath. We do measure site traffic with two analytics tools: Vercel Web
            Analytics, which counts page views without cookies, and Google Analytics 4, which
            does use cookies. Alongside page views, we record when someone clicks
            &ldquo;Book a free trial&rdquo; or &ldquo;Book class&rdquo; on a program page,
            together with that program&apos;s name, city and category, so we can see which
            programs families are interested in. Both are described below.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900">Third-party services we use</h2>
          <p className="mt-2">
            A few outside services help run CuriPath, and each processes a limited slice of data
            as part of that:
          </p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              <span className="font-medium text-slate-900">Supabase</span> hosts our database
              (your account, children, and saved/enrolled programs).
            </li>
            <li>
              <span className="font-medium text-slate-900">Vercel</span> hosts and serves the
              CuriPath website, and its Web Analytics measures how many people visit which
              pages. It does not use cookies, does not store an identifier on your device, and
              does not track you across other websites &mdash; see{" "}
              <a
                href="https://vercel.com/docs/analytics/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                Vercel&apos;s analytics privacy documentation
              </a>
              .
            </li>
            <li>
              <span className="font-medium text-slate-900">Google Analytics 4</span> measures
              page views and the booking-button clicks described above. Unlike Vercel
              Analytics, it stores cookies on your device and shares usage data with Google
              under{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                Google&apos;s privacy policy
              </a>
              . We never send Google your name, email address, or anything about your
              children. You can opt out of Google Analytics on every site using Google&apos;s{" "}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                browser opt-out add-on
              </a>
              .
            </li>
            <li>
              <span className="font-medium text-slate-900">Google Maps</span> powers the map view
              on the Explore page; loading it shares standard usage data with Google under{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                Google&apos;s own privacy policy
              </a>
              .
            </li>
            <li>
              <span className="font-medium text-slate-900">Resend</span> delivers the password
              reset emails we send you, which requires sharing your email address with them for
              that purpose.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900">Cookies</h2>
          <p className="mt-2">
            CuriPath uses a single first-party session cookie to keep you signed in. It&apos;s
            strictly necessary for the site to work — we don&apos;t use advertising or tracking
            cookies.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900">Children&apos;s privacy</h2>
          <p className="mt-2">
            CuriPath accounts are created and controlled by parents, not children. We only store
            the limited information (first name, birth year) a parent chooses to add for their
            own children, in order to filter programs by age. We don&apos;t knowingly collect
            information directly from children.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900">Data retention &amp; deletion</h2>
          <p className="mt-2">
            We keep your account information for as long as your account is active. CuriPath
            doesn&apos;t yet have a self-service &quot;delete my account&quot; option — if you&apos;d
            like your account and associated data deleted, email us at the address below and
            we&apos;ll take care of it.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900">Changes to this policy</h2>
          <p className="mt-2">
            If we make meaningful changes to this policy, we&apos;ll update the date at the top of
            this page.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900">Contact us</h2>
          <p className="mt-2">
            Questions about this policy or your data? Email{" "}
            <a
              href="mailto:curipath.contact@gmail.com"
              className="text-indigo-600 hover:underline"
            >
              curipath.contact@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
