import * as brevo from "@getbrevo/brevo";
import { deliver, Recipient } from "./mailer";

interface SendEmailToAdminParams {
  subject: string;
  htmlContent: string;
}

/**
 * Who gets the internal notifications. These were hard-coded; they are now
 * overridable from the environment so the list can be changed without a
 * deploy, with the previous addresses kept as the default so nothing moves
 * unless someone sets the variable.
 *
 * Note for whoever maintains this: the BCC address belongs to a developer, not
 * to Arabic Juniors, and every enquiry — names, phone numbers, children's
 * details — is copied to it. Set ADMIN_NOTIFY_BCC to an empty string to stop
 * that.
 */
const DEFAULT_TO = "imran.gauri@gmail.com,rafat@arabicjuniors.com";
const DEFAULT_BCC = "dvinothkumar63@gmail.com";

const parseList = (raw: string | undefined, fallback: string): Recipient[] =>
  (raw ?? fallback)
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean)
    .map((email) => ({ email, name: "Admin" }));

export const sendEmailToAdmin = async ({
  subject,
  htmlContent,
}: SendEmailToAdminParams): Promise<brevo.CreateSmtpEmail> =>
  deliver({
    senderName: "Arabic Juniors Notifications",
    to: parseList(process.env.ADMIN_NOTIFY_TO, DEFAULT_TO),
    bcc: parseList(process.env.ADMIN_NOTIFY_BCC, DEFAULT_BCC),
    subject,
    htmlContent,
  });
