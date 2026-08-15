import Link from "next/link";
import React from "react";

const PrivacyPolicyPage = () => {
  return (
    <React.Fragment>
      <div aria-describedby="privacy-policy-page" className="py-14">
        <div className="container">
          <div aria-describedby="main-wrapper">
            <div aria-describedby="content-wrapper" className="space-y-6">
              <h1 className="text-3xl font-semibold text-neutral-900">
                Privacy Policy
              </h1>
              <p className="text-neutral-700">
                Welcome to{" "}
                <Link href={"/"} className="text-blue-500 hover:underline">
                  www.arabicjuniors.com
                </Link>{" "}
                (“the Website”). This Website is operated by The Learning Hub
                FZE (“Company”, “we”, “us”, or “our”). At Arabic Juniors, we
                deeply value your privacy and are committed to protecting your
                personal information. This Privacy Policy explains how we
                collect, use, store, and protect the information you provide
                when you use our website and online tutoring services. By
                accessing or using Arabic Juniors, you agree to the practices
                described here.
              </p>

              <ul className="text-xl space-y-6 text-neutral-800 font-medium [&_p]:text-base [&_p]:font-normal [&_p]:text-neutral-700 [&_p]:mb-4 last:[&_p]:mb-0">
                <li>
                  <h4 className="mb-4">Information We Collect</h4>
                  <p>
                    When you register with Arabic Juniors, whether as a student
                    or a parent/guardian, we collect certain personal
                    information necessary to provide you with our tutoring
                    services. This information typically includes your full
                    name, email address, phone number, and details relevant to
                    the educational services you request, such as your child’s
                    school grade and subjects of interest.
                  </p>
                  <p>
                    Additionally, if you contact us directly via email, phone,
                    or through our website contact forms, we may collect
                    information included in your communication, such as your
                    message content and any attachments you provide. This helps
                    us respond accurately and effectively to your inquiries or
                    requests.
                  </p>
                  <p>
                    We also collect payment information as needed to process
                    your registration and subscription packages. This sensitive
                    information is handled securely and only shared with trusted
                    payment processors under strict confidentiality.
                  </p>
                </li>

                <li>
                  <h4 className="mb-4">How We Use Your Information</h4>
                  <p>
                    The personal data you provide is used primarily to deliver
                    and improve our tutoring services. We use your information
                    to manage your enrollment, schedule and conduct tutoring
                    sessions, and communicate important updates related to your
                    courses. For example, you will receive confirmations,
                    reminders, and notifications about your class schedules or
                    any changes.
                  </p>
                  <p>
                    We may also use your contact details to respond to your
                    questions or support requests promptly and to send you
                    information about your current courses/package.
                    Additionally, with your consent, we may inform you about new
                    courses, special offers, or relevant updates that may
                    interest you. You can always choose to opt out of such
                    marketing communications.
                  </p>
                </li>

                <li>
                  <h4 className="mb-4">Cookies and Tracking Technologies</h4>
                  <p>
                    To enhance your experience on our website, Arabic Juniors
                    uses cookies and similar tracking technologies. Cookies are
                    small data files stored on your device that help us remember
                    your preferences, such as login details and language
                    settings, so you don’t have to re-enter them each time you
                    visit.
                  </p>
                  <p>
                    We also use Google Analytics or similar tools to collect
                    anonymous information about how visitors use our site,
                    including which pages are most popular and how users
                    navigate through the site. This data helps us improve
                    website content and functionality.
                  </p>
                  <p>
                    Importantly, cookies do not collect personal information on
                    their own. Most web browsers are set to accept cookies by
                    default; however, you can disable or delete cookies through
                    your browser settings.
                  </p>
                </li>

                <li>
                  <h4 className="mb-4">Payment Information</h4>
                  <p>
                    Payments are securely handled through Stripe, which accepts
                    multiple payment methods such as Credit Cards, Google Pay,
                    Apple Pay, and other options supported by Stripe. We do not
                    store your card details; Stripe manages all payment
                    information safely and securely.
                  </p>
                </li>

                <li>
                  <h4 className="mb-4">Data Sharing and Third Parties</h4>
                  <p>
                    Arabic Juniors does not sell, trade, or rent your personal
                    information to any third parties. However, to operate
                    efficiently and provide high-quality tutoring services, we
                    may share necessary data with trusted third-party service
                    providers, such as payment processors or technical support
                    teams. These partners are obligated to keep your information
                    confidential and use it solely for the purposes we specify.
                  </p>
                  <p>
                    We do not include or promote third-party advertisements or
                    products on our platform, ensuring that your information is
                    not exposed to unrelated commercial entities.
                  </p>
                </li>

                <li>
                  <h4 className="mb-4">Data Storage & Security</h4>
                  <p>
                    Protecting your personal information is a top priority for
                    us. We implement appropriate technical and organisational
                    safeguards designed to secure your data against unauthorized
                    access, alteration, disclosure, or destruction. This
                    includes secure data storage, encryption where appropriate,
                    and access controls limiting data to authorized personnel
                    only.
                  </p>

                  <ul className="mt-4 list-disc pl-4">
                    <li>
                      <p>
                        <strong>SSL Encryption:</strong> All information shared
                        between you and our website is protected with SSL
                        (Secure Socket Layer) encryption to keep your data safe.
                      </p>
                    </li>
                    <li>
                      <p>
                        <strong>Payment Gateway Security:</strong> All card
                        payments are processed securely through Stripe, a
                        trusted payment provider that follows strict security
                        standards to protect your information.
                      </p>
                    </li>
                  </ul>
                </li>

                <li>
                  <h4 className="mb-4">Your Rights and Choices</h4>
                  <p>
                    You have full control over your personal information with
                    Arabic Juniors. At any time, you may access and update the
                    information you have provided to us. If you wish, you may
                    also request that we delete your personal data, subject to
                    any legal or contractual obligations that require us to
                    retain certain information.
                  </p>
                  <p>
                    Regarding communications, you can opt out of receiving
                    promotional emails, messages, or notifications by following
                    the unsubscribe instructions provided or by contacting us
                    directly.
                  </p>
                </li>

                <li>
                  <h4 className="mb-4">Changes to This Privacy Policy</h4>
                  <p>
                    Arabic Juniors may update this Privacy Policy occasionally
                    to reflect changes in legal requirements, technology, or our
                    business practices. When updates occur, we will revise the
                    "Last Updated" date at the bottom of this page and encourage
                    you to review the policy periodically to stay informed about
                    how we protect your information.
                  </p>
                </li>

                <li>
                  <h4 className="mb-4">Consent</h4>
                  <p>
                    By using Arabic Juniors’ website and tutoring services, you
                    acknowledge that you have read, understood, and agreed to
                    the terms of this Privacy Policy. Your continued use of our
                    services constitutes your consent to the collection and use
                    of your information as described above.
                  </p>
                </li>
              </ul>
              <span className="text-xs font-normal text-neutral-800 block mt-6">Last Updated: May-2025</span>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default PrivacyPolicyPage;
