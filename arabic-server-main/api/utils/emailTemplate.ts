/**
 * One layout for every email this app sends.
 *
 * Email HTML is not web HTML. What is used here and why:
 *
 *  - Tables for layout. Outlook renders through Word, which has no flexbox,
 *    no grid, and no reliable `div` box model.
 *  - Inline styles on every element that matters. Gmail serves a `<style>`
 *    block to its own webmail, but strips it in the Gmail app when the account
 *    is not a Gmail account. Anything load-bearing has to survive that; the
 *    `<style>` block below carries only enhancements.
 *  - A system font stack. Web fonts fail in Outlook and most Android clients,
 *    and a failed web font falls back to Times, which looks broken.
 *  - 600px maximum. Wider than that is cut off in the Outlook reading pane.
 *  - The design holds up with images switched off. Many clients block remote
 *    images by default, so the logo is decoration and the wordmark it falls
 *    back to is white-on-blue alt text, not an empty hole.
 *
 * On escaping — do NOT escape values before passing them in. The global
 * middleware in api/index.ts already runs every request body through
 * sanitize-html, which strips tags and escapes `&` and `<`. Escaping a second
 * time here is visible to the reader: "Tom & Jerry" becomes "Tom &amp; Jerry"
 * on screen. Attribute positions are the exception — sanitize-html leaves
 * double quotes alone — so anything going into an href or a title attribute
 * goes through `attr()` below.
 */

const BRAND = {
  blue: "#0B46AD",
  orange: "#FB6238",
  yellow: "#FFC72C",
  ink: "#0F172A",
  body: "#475569",
  muted: "#94A3B8",
  border: "#E6EBF2",
  panel: "#F7F9FC",
  page: "#EEF2F7",
  white: "#FFFFFF",
};

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";

const siteUrl = () =>
  (process.env.EMAIL_BRAND_URL || "https://arabicjuniors.com").replace(/\/+$/, "");

/**
 * The old templates disagreed with each other — some footers said
 * info@arabicjuniors.com and others hello@arabicjuniors.com. hello@ is the
 * address verified as a sender in Brevo, so a reply to it actually arrives.
 */
const CONTACT = {
  phone: "+971 50 992 1470",
  phoneHref: "+971509921470",
  whatsapp: "971509921470",
  email: "hello@arabicjuniors.com",
};

/**
 * The optimised copy, not the raw file in public/. The original PNG is 691 KB;
 * this one is under 8 KB, and an email is a poor place to spend most of a
 * megabyte on a logo. Overridable because the path belongs to the frontend's
 * image optimiser and is not this service's to guarantee.
 */
const logoUrl = () =>
  process.env.EMAIL_LOGO_URL ||
  "https://arabicjuniors.com/_next/image?url=%2Farabic-logo-new.png&w=384&q=75";

/** Escapes a value destined for an HTML attribute. See the note above. */
export const attr = (value: string): string =>
  String(value ?? "").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/**
 * Keeps the line breaks a visitor typed into a message box. Without this a
 * paragraphed enquiry arrives as one unbroken block, because HTML collapses
 * newlines. The old templates solved this with `<pre>`, which also switched the
 * text to a monospace font and stopped it wrapping in narrow clients.
 */
export const nl2br = (text?: string | null): string =>
  String(text ?? "").replace(/\r\n|\r|\n/g, "<br />");

/** A clickable address that cannot break out of the href attribute. */
export const mailLink = (email?: string | null): string =>
  email
    ? `<a href="mailto:${attr(email)}" style="color:${BRAND.blue};text-decoration:none;">${email}</a>`
    : "";

export const telLink = (phone?: string | null): string =>
  phone
    ? `<a href="tel:${attr(String(phone).replace(/[^\d+]/g, ""))}" style="color:${BRAND.blue};text-decoration:none;">${phone}</a>`
    : "";

export type Tone = "blue" | "orange" | "green";

const TONES: Record<Tone, { bg: string; border: string; text: string }> = {
  blue: { bg: "#EEF4FE", border: BRAND.blue, text: "#0B3F97" },
  orange: { bg: "#FFF4F0", border: BRAND.orange, text: "#B23F1F" },
  green: { bg: "#EDF9F3", border: "#0FA36B", text: "#0A6B47" },
};

const accentOf = (tone: Tone) =>
  tone === "blue" ? BRAND.blue : tone === "green" ? "#0FA36B" : BRAND.orange;

export interface DetailRow {
  label: string;
  /** Rendered as-is. Empty values fall back to a muted em dash. */
  value?: string | number | null;
  /** Renders across the full width — for long free text like an introduction. */
  wide?: boolean;
}

/**
 * Label/value pairs. Zebra striping rather than a rule under every row: at the
 * twenty-odd fields a teacher application carries, ruled rows turn into a wall
 * of lines.
 */
export const detailTable = (rows: DetailRow[]): string => {
  const cells = rows
    .filter((r) => r && r.label)
    .map((row, i) => {
      const zebra = i % 2 === 0 ? BRAND.white : BRAND.panel;
      const raw = row.value;
      const empty = raw === null || raw === undefined || String(raw).trim() === "";
      const value = empty
        ? `<span style="color:${BRAND.muted};">&mdash;</span>`
        : String(raw);

      const label = `<span style="font-size:11px;line-height:16px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${BRAND.muted};">${row.label}</span>`;

      if (row.wide) {
        return `
      <tr>
        <td colspan="2" style="padding:12px 18px;background:${zebra};font-family:${FONT};">
          ${label}
          <div style="margin-top:5px;font-size:14px;line-height:22px;color:${BRAND.ink};">${value}</div>
        </td>
      </tr>`;
      }

      return `
      <tr>
        <td class="lbl" width="38%" valign="top" style="padding:11px 8px 11px 18px;background:${zebra};font-family:${FONT};">${label}</td>
        <td class="val" width="62%" valign="top" style="padding:11px 18px 11px 8px;background:${zebra};font-family:${FONT};font-size:14px;line-height:21px;font-weight:600;color:${BRAND.ink};">${value}</td>
      </tr>`;
    })
    .join("");

  return `
  <table role="presentation" class="stack" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="width:100%;border-collapse:separate;border-spacing:0;border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;">
    ${cells}
  </table>`;
};

/** A tinted panel for the one fact the reader must not miss. */
export const callout = ({
  title,
  body,
  tone = "blue",
}: {
  title: string;
  body?: string;
  tone?: Tone;
}): string => {
  const t = TONES[tone];
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
    <tr>
      <td style="padding:14px 18px;background:${t.bg};border-left:4px solid ${t.border};border-radius:8px;font-family:${FONT};">
        <div style="font-size:15px;line-height:23px;font-weight:700;color:${t.text};">${title}</div>
        ${body ? `<div style="margin-top:4px;font-size:14px;line-height:21px;color:${BRAND.body};">${body}</div>` : ""}
      </td>
    </tr>
  </table>`;
};

/**
 * Table-based rather than a styled anchor: Outlook drops padding on inline
 * elements, which collapses a styled `<a>` into bare text.
 */
export const button = ({ label, url }: { label: string; url: string }): string => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
    <tr>
      <td align="center" style="border-radius:10px;background:${BRAND.orange};">
        <a href="${attr(url)}"
           style="display:inline-block;padding:13px 30px;font-family:${FONT};font-size:15px;font-weight:700;color:${BRAND.white};text-decoration:none;border-radius:10px;">${label}</a>
      </td>
    </tr>
  </table>`;

export const paragraph = (text: string): string =>
  `<p style="margin:0 0 14px;font-family:${FONT};font-size:15px;line-height:24px;color:${BRAND.body};">${text}</p>`;

export const heading = (text: string): string =>
  `<h2 style="margin:0 0 10px;font-family:${FONT};font-size:16px;line-height:24px;font-weight:800;color:${BRAND.ink};">${text}</h2>`;

export const spacer = (px = 22): string =>
  `<div style="line-height:${px}px;height:${px}px;font-size:0;">&nbsp;</div>`;

export interface LayoutOptions {
  /** The grey line the inbox shows after the subject. Worth writing properly. */
  preheader: string;
  /** Small coloured label above the title. */
  eyebrow?: string;
  title: string;
  /** Everything between the title and the footer, already HTML. */
  content: string;
  /** Quiet line at the very bottom, above the sign-off. */
  footerNote?: string;
  accent?: Tone;
}

/**
 * The document these produce carries no explanatory HTML comments. Comments
 * inside the template literal are shipped to every recipient — extra bytes on
 * each send, internal notes readable from "view source", and in one case the
 * literal text "<script>" sitting in outgoing mail for a spam filter to weigh.
 * The reasoning therefore lives here instead:
 *
 * - `color-scheme: light only` pins the palette. These colours are chosen as a
 *   set; a client inverting them gives orange-on-brown and unreadable greys.
 * - The `<style>` block is enhancement only. Gmail strips it for non-Gmail
 *   accounts in its mobile app, so nothing load-bearing may live there.
 * - `a[x-apple-data-detectors]` stops iOS turning dates and phone numbers in
 *   the body into its own blue links, which overrides the design.
 * - The hidden div at the top is the inbox preview line, padded with zero-width
 *   non-joiners so the client does not trail real body text in after it.
 * - Social links are text, not icons. The icons here previously loaded from
 *   third-party CDNs, which most clients block by default and which report a
 *   read back to that CDN whenever one does load.
 * - The year is rendered server-side. The templates this replaces printed it
 *   with `document.write` inside a `<script>` tag; every mail client strips
 *   scripts, so the year silently never appeared at all.
 */
export const emailLayout = ({
  preheader,
  eyebrow,
  title,
  content,
  footerNote,
  accent = "orange",
}: LayoutOptions): string => {
  const accentColor = accentOf(accent);

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="color-scheme" content="light only" />
<meta name="supported-color-schemes" content="light only" />
<title>${attr(title)}</title>
<style type="text/css">
  body { margin:0 !important; padding:0 !important; width:100% !important; }
  img { border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
  table { border-collapse:collapse !important; }
  a { color:${BRAND.blue}; }
  a[x-apple-data-detectors] { color:inherit !important; text-decoration:none !important; }
  @media only screen and (max-width:480px) {
    .wrap { width:100% !important; }
    .pad { padding-left:20px !important; padding-right:20px !important; }
    .stack .lbl, .stack .val { display:block !important; width:100% !important; }
    .stack .lbl { padding:11px 18px 0 18px !important; }
    .stack .val { padding:2px 18px 11px 18px !important; }
    .h1 { font-size:22px !important; line-height:30px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${BRAND.page};">

<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${BRAND.page};opacity:0;">
  ${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.page};">
  <tr>
    <td align="center" style="padding:28px 12px;">

      <table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0"
             style="width:600px;max-width:600px;background:${BRAND.white};border-radius:16px;overflow:hidden;box-shadow:0 2px 10px rgba(15,23,42,.06);">

        <!-- Header -->
        <tr>
          <td align="center" style="background:${BRAND.blue};padding:24px 24px 20px;">
            <img src="${attr(logoUrl())}" width="150" alt="Arabic Juniors"
                 style="display:block;width:150px;max-width:150px;height:auto;font-family:${FONT};font-size:19px;font-weight:800;color:${BRAND.white};" />
          </td>
        </tr>
        <tr><td style="height:4px;line-height:4px;font-size:0;background:${accentColor};">&nbsp;</td></tr>

        <!-- Body -->
        <tr>
          <td class="pad" style="padding:30px 34px 12px;">
            ${
              eyebrow
                ? `<div style="font-family:${FONT};font-size:11px;line-height:16px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:${accentColor};">${eyebrow}</div>`
                : ""
            }
            <h1 class="h1" style="margin:${eyebrow ? "8px" : "0"} 0 18px;font-family:${FONT};font-size:25px;line-height:33px;font-weight:800;color:${BRAND.ink};letter-spacing:-.01em;">${title}</h1>
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td class="pad" style="padding:26px 34px 30px;">
            <div style="height:1px;line-height:1px;font-size:0;background:${BRAND.border};">&nbsp;</div>
            ${
              footerNote
                ? `<p style="margin:18px 0 0;font-family:${FONT};font-size:13px;line-height:20px;color:${BRAND.body};">${footerNote}</p>`
                : ""
            }
            <p style="margin:18px 0 0;font-family:${FONT};font-size:13px;line-height:21px;font-weight:700;color:${BRAND.ink};">
              <a href="${attr(siteUrl())}" style="color:${BRAND.ink};text-decoration:none;">Arabic Juniors</a>
            </p>
            <p style="margin:3px 0 0;font-family:${FONT};font-size:12px;line-height:20px;color:${BRAND.muted};">
              Online Arabic tuition for UAE school students
            </p>
            <p style="margin:10px 0 0;font-family:${FONT};font-size:12px;line-height:20px;color:${BRAND.body};">
              <a href="tel:${attr(CONTACT.phoneHref)}" style="color:${BRAND.body};text-decoration:none;">${CONTACT.phone}</a>
              &nbsp;&middot;&nbsp;
              <a href="mailto:${attr(CONTACT.email)}" style="color:${BRAND.body};text-decoration:none;">${CONTACT.email}</a>
              &nbsp;&middot;&nbsp; United Arab Emirates
            </p>
            <p style="margin:10px 0 0;font-family:${FONT};font-size:12px;line-height:20px;">
              <a href="https://wa.me/${attr(CONTACT.whatsapp)}" style="color:${BRAND.blue};font-weight:600;text-decoration:none;">WhatsApp</a>
              <span style="color:${BRAND.muted};">&nbsp;&middot;&nbsp;</span>
              <a href="https://facebook.com/arabicjuniors" style="color:${BRAND.blue};font-weight:600;text-decoration:none;">Facebook</a>
              <span style="color:${BRAND.muted};">&nbsp;&middot;&nbsp;</span>
              <a href="https://instagram.com/arabicjuniors" style="color:${BRAND.blue};font-weight:600;text-decoration:none;">Instagram</a>
            </p>
            <p style="margin:12px 0 0;font-family:${FONT};font-size:11px;line-height:18px;color:${BRAND.muted};">
              <a href="${attr(siteUrl())}/privacy-policy" style="color:${BRAND.muted};text-decoration:underline;">Privacy Policy</a>
              &nbsp;&middot;&nbsp;
              <a href="${attr(siteUrl())}/terms-and-conditions" style="color:${BRAND.muted};text-decoration:underline;">Terms &amp; Conditions</a>
            </p>
            <p style="margin:6px 0 0;font-family:${FONT};font-size:11px;line-height:18px;color:${BRAND.muted};">
              &copy; ${new Date().getFullYear()} Arabic Juniors. All rights reserved.
            </p>
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
</html>`;
};

export { BRAND, FONT };
