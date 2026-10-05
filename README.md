# Adetech Solar

A mobile-first solar storefront for Nigerian homes and businesses. It includes a product catalog, account foundation, persisted cart, protected checkout flow, Paystack verification/webhook handlers, service quotes and an admin workspace.

## Local setup

Requirements: Node.js 20.9+ and npm.

1. Install packages: `npm install`.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`, `PAYSTACK_SECRET_KEY`, `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, and `ADMIN_EMAIL`. Add Google OAuth keys to enable Google sign-in.
3. Create a PostgreSQL database in Neon or Supabase and run `npx prisma migrate deploy` (Vercel runs this during deployments once environment variables are set).
4. Generate Prisma Client and seed products: `npm run db:generate` then `npm run db:seed`.
5. Start the app: `npm run dev`.

Without `DATABASE_URL`, the home, shop and product detail routes use demo catalog data. Accounts, checkout, quotes and admin mutations require a configured database. Paystack checkout additionally requires a valid secret key.

## Vercel deployment

1. Push the project to a Git provider and import it in Vercel. Add every environment variable from `.env.example` to the Vercel project for Preview and Production (use Paystack test keys for Preview).
2. Provision PostgreSQL with Neon or Supabase and copy its pooled/runtime connection string to `DATABASE_URL`. Use the provider's direct connection string for migrations if a pooled URL is unsuitable for Prisma migrations.
3. The Vercel build uses `vercel-build`: it runs `prisma generate`, applies committed migrations with `prisma migrate deploy`, then runs `next build`. Run `npm run db:seed` once against production if the catalog is empty.
4. Set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS domain. Configure Google OAuth's authorised origin and callback at `https://YOUR_DOMAIN/api/auth/callback/google`.
5. In Paystack Dashboard, set the webhook URL to `https://YOUR_DOMAIN/api/payments/webhook`. Keep the secret key server-only. The handler checks `x-paystack-signature` using HMAC SHA-512; checkout return also calls Paystack's verify endpoint before marking orders paid. Use the deployed `/checkout/success` return path.
6. Configure a verified Resend sending domain and set `EMAIL_FROM`, `RESEND_API_KEY`, and `ADMIN_EMAIL` for verification, password reset, order confirmation and quote email.
7. Promote a trusted account to admin directly in PostgreSQL: `UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@example.com';` Sign out and back in to refresh the role claim.
8. Verify a test payment end-to-end, and confirm the Paystack dashboard delivers the webhook before enabling live keys.

## Checks

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

Product photography currently uses remote Unsplash image URLs via `next/image`. Admin product creation accepts hosted image URLs; connect a managed upload provider (for example Vercel Blob or Cloudinary) before offering direct image-file uploads.
