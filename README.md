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
`BREVO_V1_API_KEY`, `BREVO_VERIFIED_SENDER_EMAIL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
`CLOUDINARY_API_SECRET`, `MASTER_2FA_RESET_KEY`.

Frontend needs: `NEXT_PUBLIC_API_BASE_URL`.

## Deployment

Both packages deploy to a DigitalOcean droplet via GitHub Actions on push to `main`
(see `.github/workflows/deploy.yml` in each folder), and run under pm2.
