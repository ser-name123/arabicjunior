import * as brevo from "@getbrevo/brevo";
import { SendEmailParams } from "../types";
import { deliver } from "./mailer";

/**
 * Mail to a single customer. The transport (Brevo SMTP or Brevo HTTP API) is
 * chosen in ./mailer from whichever credentials the environment carries.
 */
export const sendEmail = async ({
  toEmail,
  toName,
  subject,
  htmlContent,
}: SendEmailParams): Promise<brevo.CreateSmtpEmail> =>
  deliver({
    senderName: "Arabic Juniors",
    to: [{ email: toEmail, name: toName }],
    subject,
    htmlContent,
  });
