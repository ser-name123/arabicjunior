import * as brevo from "@getbrevo/brevo";
import nodemailer, { Transporter } from "nodemailer";

/**
 * One place that actually puts mail on the wire.
 *
 * Brevo offers the same transactional mailbox through two doors, and which one
 * an account has credentials for varies:
 *
 *   - SMTP relay  — a login (`…@smtp-brevo.com`) and an SMTP key, from
 *                   Brevo → SMTP & API → SMTP.
 *   - HTTP API    — a `xkeysib-…` key, from the same page's API keys tab.
 *
 * Rather than commit to one and break if the owner holds the other, this picks
 * whichever is configured, preferring SMTP because that is what was asked for.
 * Callers do not know or care which ran.
 *
 * Why SMTP is not simply assumed: several hosts (Render among them) block
 * outbound connections on the SMTP ports on their cheaper plans. If that turns
 * out to be the case in production, dropping the two SMTP variables makes the
 * HTTP API take over — no code change, no redeploy of anything but the config.
 *
 * Nothing here throws. A registration must not fail because a receipt email
 * could not be delivered, which is the behaviour the previous per-file senders
 * already had and is preserved deliberately.
 */

export interface Recipient {
  email: string;
  name?: string;
}

export interface DeliverParams {
  senderName: string;
  to: Recipient[];
  bcc?: Recipient[];
  subject: string;
  htmlContent: string;
}

type Transport = "smtp" | "api" | "none";

const senderEmail = () => process.env.BREVO_VERIFIED_SENDER_EMAIL?.trim() || "";

const smtpConfig = () => {
  const login = process.env.BREVO_SMTP_LOGIN?.trim();
  const key = process.env.BREVO_SMTP_KEY?.trim();
  if (!login || !key) return null;

  // 465 is implicit TLS; 587 (and 2525) start in the clear and upgrade with
  // STARTTLS. Deriving `secure` from the port rather than hard-coding it means
  // switching ports in the environment cannot silently produce a plaintext
  // session on a port that expects TLS from the first byte.
  const port = Number(process.env.BREVO_SMTP_PORT) || 587;

  return {
    host: process.env.BREVO_SMTP_HOST?.trim() || "smtp-relay.brevo.com",
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user: login, pass: key },
    // Without these, a host that silently drops SMTP traffic leaves the socket
    // hanging until the OS gives up — minutes, with the HTTP request that
    // triggered the send still open. Ten seconds is far longer than a healthy
    // relay needs and short enough that a blocked port fails fast.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  };
};

const apiKey = () => process.env.BREVO_V1_API_KEY?.trim() || "";

let transporter: Transporter | null = null;
let apiInstance: brevo.TransactionalEmailsApi | null = null;
let announced = false;

const activeTransport = (): Transport => {
  if (smtpConfig()) return "smtp";
  if (apiKey()) return "api";
  return "none";
};

/** Logged once at first send so the deploy log records which door is in use. */
const announce = (transport: Transport) => {
  if (announced) return;
  announced = true;

  if (transport === "smtp") {
    const cfg = smtpConfig()!;
    console.log(`Email transport: Brevo SMTP (${cfg.host}:${cfg.port}), sender ${senderEmail()}`);
  } else if (transport === "api") {
    console.log(`Email transport: Brevo HTTP API, sender ${senderEmail()}`);
  } else {
    console.warn(
      "Email transport: NONE. Set BREVO_SMTP_LOGIN + BREVO_SMTP_KEY (or BREVO_V1_API_KEY). " +
        "Mail is being dropped, not queued."
    );
  }
};

const getTransporter = (): Transporter => {
  if (!transporter) transporter = nodemailer.createTransport(smtpConfig()!);
  return transporter;
};

const getApiInstance = (): brevo.TransactionalEmailsApi => {
  if (!apiInstance) {
    apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey());
  }
  return apiInstance;
};

/** `Name <address>`, or the bare address when there is no name to show. */
const formatAddress = (r: Recipient) =>
  r.name ? `"${r.name.replace(/"/g, "")}" <${r.email}>` : r.email;

export const deliver = async ({
  senderName,
  to,
  bcc,
  subject,
  htmlContent,
}: DeliverParams): Promise<brevo.CreateSmtpEmail> => {
  const transport = activeTransport();
  announce(transport);

  if (transport === "none") return {};

  const from = senderEmail();
  if (!from) {
    console.error("BREVO_VERIFIED_SENDER_EMAIL is not set — refusing to send with no sender.");
    return {};
  }

  try {
    if (transport === "smtp") {
      const info = await getTransporter().sendMail({
        from: `"${senderName.replace(/"/g, "")}" <${from}>`,
        to: to.map(formatAddress).join(", "),
        bcc: bcc?.length ? bcc.map(formatAddress).join(", ") : undefined,
        subject,
        html: htmlContent,
      });
      console.log("Email sent via SMTP:", info.messageId);
      return { messageId: info.messageId };
    }

    const response = await getApiInstance().sendTransacEmail({
      sender: { name: senderName, email: from },
      to: to.map((r) => ({ email: r.email, name: r.name })),
      ...(bcc?.length ? { bcc: bcc.map((r) => ({ email: r.email, name: r.name })) } : {}),
      subject,
      htmlContent,
    });
    console.log("Email sent via Brevo API:", response.body);
    return response.body as brevo.CreateSmtpEmail;
  } catch (error: unknown) {
    // Deliberately swallowed — see the note at the top of this file.
    if (error instanceof brevo.HttpError) {
      console.error("Brevo API error (non-blocking):", error.response);
    } else {
      console.error("Email send failed (non-blocking):", error);
    }
    return {};
  }
};

/**
 * Open a connection and authenticate without sending anything. Used by
 * `pnpm email:check` so bad credentials surface on demand rather than as a
 * silent non-delivery days later.
 */
export const verifyTransport = async (): Promise<{ transport: Transport; ok: boolean; detail: string }> => {
  const transport = activeTransport();

  if (transport === "none") {
    return { transport, ok: false, detail: "No Brevo credentials configured." };
  }
  if (!senderEmail()) {
    return { transport, ok: false, detail: "BREVO_VERIFIED_SENDER_EMAIL is not set." };
  }

  try {
    if (transport === "smtp") {
      await getTransporter().verify();
      const cfg = smtpConfig()!;
      return { transport, ok: true, detail: `Authenticated with ${cfg.host}:${cfg.port}.` };
    }
    // The API has no no-op probe; fetching the account is the cheapest call
    // that proves the key is accepted.
    const account = new brevo.AccountApi();
    account.setApiKey(brevo.AccountApiApiKeys.apiKey, apiKey());
    await account.getAccount();
    return { transport, ok: true, detail: "API key accepted." };
  } catch (error: unknown) {
    const detail =
      error instanceof brevo.HttpError
        ? `HTTP ${error.statusCode ?? "?"}: ${JSON.stringify(error.body)}`
        : (error as Error)?.message || String(error);
    return { transport, ok: false, detail };
  }
};
