# Cloaka Credentials Checklist

These are the values you still need to provide before Cloaka can be connected to real infrastructure and third-party services.

## Core Runtime

- `DATABASE_URL`
- `DIRECT_DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

## Local or Hosted Infrastructure

- `REDIS_URL`

## Storage

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_S3_BUCKET`

## Email

- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`
- `SENDGRID_FROM_NAME`

## SMS

- `TERMII_API_KEY`
- `TERMII_SENDER_ID`

## Payments

- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_PUBLIC_KEY`
- `FLUTTERWAVE_SECRET_KEY`
- `FLUTTERWAVE_PUBLIC_KEY`
- `FLUTTERWAVE_ENCRYPTION_KEY`

## Virtual Accounts

- `VIRTUAL_ACCOUNT_PROVIDER`
- `PROVIDUS_CLIENT_ID`
- `PROVIDUS_SECRET_KEY`
- `WEMA_CLIENT_ID`
- `WEMA_SECRET_KEY`

## KYB / KYC

- `KYC_PROVIDER`
- `YOUVERIFY_API_KEY`
- `SMILE_PARTNER_ID`
- `SMILE_API_KEY`
- `PREMBLY_APP_ID`
- `PREMBLY_X_API_KEY`

## Resconate Task Marketplace

- `TASK_MARKETPLACE_BASE_URL`
- `TASK_MARKETPLACE_WEBHOOK_SECRET`
- `TASK_MARKETPLACE_CLIENT_ID`
- `TASK_MARKETPLACE_CLIENT_SECRET`

## Security / Encryption

- `FIELD_ENCRYPTION_KEY`

## Notes

- For Supabase, use `DATABASE_URL` for the pooler/session connection used by the app.
- Use `DIRECT_DATABASE_URL` for the direct IPv6 connection used by Prisma migrations when your environment supports it.
- If your environment does not support IPv6, leave `DIRECT_DATABASE_URL` empty and run migrations from a machine or CI environment that does.
- Only a subset is required for the currently implemented runtime path.
- The rest are already declared so the repo has a complete handoff surface for future integrations.
