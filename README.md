# arabicjunior

Monorepo for the Arabic Juniors platform.

## Structure

| Folder | Description | Stack |
| --- | --- | --- |
| [`arabicjunior-main/`](arabicjunior-main/) | Public website + admin dashboard | Next.js 15 (App Router), React 19, Tailwind, shadcn/ui |
| [`arabic-server-main/`](arabic-server-main/) | REST API | Express 4, TypeScript, Mongoose / MongoDB |

## Getting started

Both packages use **pnpm**.

### Frontend

```bash
cd arabicjunior-main
pnpm install
cp .example.env .env      # set NEXT_PUBLIC_API_BASE_URL
pnpm dev                  # http://localhost:3000
```

### Backend

```bash
cd arabic-server-main
pnpm install
cp .env.example .env      # set MONGODB_URI, JWT_SECRET, BREVO_*, CLOUDINARY_*
pnpm dev                  # http://localhost:5000
```

## Environment variables

`.env` files are **not** committed. See `.example.env` / `.env.example` in each package for
the required keys.

Backend needs: `PORT`, `NODE_ENV`, `MONGODB_URI`, `JWT_SECRET`, `SESSION_SECRET`, `CLIENT_URL`,
`BREVO_VERIFIED_SENDER_EMAIL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
`CLOUDINARY_API_SECRET`, `MASTER_2FA_RESET_KEY`.

### Email

Brevo, reachable two ways; set **one**:

| Transport | Variables | Where to get them |
| --- | --- | --- |
| SMTP relay (preferred) | `BREVO_SMTP_HOST`, `BREVO_SMTP_PORT`, `BREVO_SMTP_LOGIN`, `BREVO_SMTP_KEY` | Brevo → SMTP & API → **SMTP** |
| HTTP API (fallback) | `BREVO_V1_API_KEY` | Brevo → SMTP & API → **API keys** |

SMTP wins when both are present. Use the HTTP API where the host blocks outbound
SMTP ports — several PaaS plans do. With neither set, mail is dropped and a
warning is logged once; sends never throw, so a failed email cannot break a
registration.

Check the credentials before trusting them:

```bash
cd arabic-server-main
pnpm email:check                  # authenticate only
pnpm email:check you@example.com  # authenticate, then send one real message
```

Note: some hosts, Render among them, block outbound SMTP ports on their cheaper
plans. A send that takes ~10s per message and never arrives is that block, not a
bad key — switch to the HTTP API. Brevo may also restrict an API key to
allow-listed IPs (Brevo -> Security -> Authorised IPs); add every outbound IP the
host lists for the service, not just the one an error names.

### Email templates

All messages share one layout, `api/utils/emailTemplate.ts` — a header, a
`detailTable` of label/value pairs, `callout`, `button` and a common footer.
Templates themselves live in `api/services/emailService.ts` and the three form
controllers.

Preview every template without sending anything:

```bash
pnpm email:preview        # writes email-preview/*.html, open index.html
```

Two rules when editing them:

- **Do not escape values.** The middleware in `api/index.ts` already runs bodies
  through sanitize-html, so escaping again shows `&amp;` to the reader. Values
  going into an `href` or other attribute use `attr()`.
- **No explanatory HTML comments inside the template literal.** They ship to
  every recipient. Put the reasoning in TypeScript comments outside it.

`BREVO_VERIFIED_SENDER_EMAIL` must be verified as a sender in Brevo or every
message bounces. `ADMIN_NOTIFY_TO` / `ADMIN_NOTIFY_BCC` (comma-separated)
override who receives internal enquiry notifications.

Frontend needs: `NEXT_PUBLIC_API_BASE_URL`.

## Deployment

Both packages deploy to a DigitalOcean droplet via GitHub Actions on push to `main`
(see `.github/workflows/deploy.yml` in each folder), and run under pm2.
