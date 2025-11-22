# MiniCourse Server

This API powers the MiniCourse application.

## Default admin account

When the server starts it automatically ensures an administrator account exists. You can override the credentials with environment variables:

- `ADMIN_NAME` – display name for the admin (default: `MiniCourse Admin`)
- `ADMIN_EMAIL` – login email (default: `admin@minicourse.dev`)
- `ADMIN_PASSWORD` – login password (default: `Admin@1234`)
- `ADMIN_FORCE_RESET` – set to `true` to reset the admin account (email + password) to the values above on the next server start

If no admin currently exists, the account will be created (or an existing user with the same email will be promoted). Check the server logs on startup to confirm the credentials.

If you forget the admin password or need to switch the email, set the new values in `.env`, add `ADMIN_FORCE_RESET=true`, restart the server once, and then remove the flag (so credentials are not reset on every boot).

Use these credentials to sign in on the client and access the admin dashboard at `/admin/dashboard`.

## Email delivery

Outgoing transactional email is powered by [SendGrid](https://sendgrid.com/). Configure the following environment variables to enable email notifications:

- `SENDGRID_API_KEY` – API key with mail send permission
- `SENDGRID_FROM` – verified sender (for example, `MiniCourse <no-reply@minicourse.dev>`)

Once both values are present the server automatically initialises SendGrid and sends payment confirmation emails to learners.

## Validation & Error Handling

- Request payloads are validated using Zod schemas under `src/validation`. Validation failures respond with HTTP `422` and a `details` map describing field-level issues.
- The global error middleware (`src/middleware/errorMiddleware.js`) standardises all error responses with `status`, `message`, and optional `details`. Stack traces are included only when `NODE_ENV !== 'production'`.
- SendGrid errors are normalised so a `403 Forbidden` response clearly calls out missing sender verification or permission scopes, helping operators fix delivery quickly.
