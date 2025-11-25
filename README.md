# MiniCourse Platform

MiniCourse is a MERN-stack learning marketplace with a modern Vite + React frontend and an Express + MongoDB backend. It supports secure authentication, course management, payments through Razorpay, transactional email via SendGrid, and robust error handling across the stack.

## Highlights

- **Secure auth** with JWT-backed sessions, guarded routes, and admin tooling.
- **Course catalog & admin CRUD** with client-side validation and server-side schema enforcement.
- **Razorpay checkout** covering order creation, payment capture, signature verification, and webhook reconciliation.
- **SendGrid email delivery** for post-payment confirmations, including actionable error surfaces when delivery fails.
- **Global validation & error handling** using Zod on the backend and normalized Axios responses surfaced through toasts/modals on the frontend.
- **Responsive UX feedback** with loaders, optimistic updates, and contextual notifications for all critical flows.

## Prerequisites

- Node.js 18+
- MongoDB instance (local or hosted)
- Razorpay account with API keys and an optional webhook secret

## Environment Configuration

Copy the sample files and then fill them with your credentials:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### MongoDB Atlas

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas/database) and add a database user with the `readWriteAnyDatabase` role (or similar for the specific DB).
2. Whitelist your IP (or `0.0.0.0/0` for local testing) under *Network Access*.
3. Copy the SRV connection string from *Database > Connect > Drivers* and paste it into `MONGO_URI` (replace `<username>` and `<password>` inline).
4. Keep the `/minicourse` database name so the models use the expected database, or update the URI if you prefer another name.

### Server variables (`server/.env`)

| Variable | Description | Example |
| --- | --- | --- |
| `NODE_ENV` | `development`, `production`, etc. | `development` |
| `PORT` | API port (Express defaults to `5000`). | `5000` |
| `CLIENT_URL` | Base URL of the frontend for reset links. | `http://localhost:5173` |
| `MONGO_URI` | MongoDB Atlas SRV URI. | `mongodb+srv://admin:password@cluster0.abc.mongodb.net/minicourse` |
| `JWT_SECRET` | 64+ char secret for signing tokens. | `p9X...` |
| `JWT_EXPIRES_IN` | Token lifespan. | `1d` |
| `RESET_TOKEN_EXPIRY_MINUTES` | Password reset token TTL. | `30` |
| `ADMIN_NAME` | Display name for the auto-provisioned admin. | `MiniCourse Admin` |
| `ADMIN_EMAIL` | Admin login email. | `founder@company.com` |
| `ADMIN_PASSWORD` | Admin login password (used on bootstrap/reset). | `StrongPassw0rd!` |
| `ADMIN_FORCE_RESET` | Set to `true` to overwrite the stored admin credentials on next boot. | `false` |
| `RAZORPAY_KEY_ID` | Public key used when creating checkout orders. | `rzp_test_abc123` |
| `RAZORPAY_KEY_SECRET` | Razorpay secret used for signatures and verification. | `your_secret` |
| `RAZORPAY_WEBHOOK_SECRET` | Optional webhook signing secret. | `whsec_xxx` |
| `RAZORPAY_CURRENCY` | Default currency for orders. | `INR` |
| `SENDGRID_API_KEY` | API key with “Mail Send” permission. | `SG.xxxxxx` |
| `SENDGRID_FROM` | Verified sender identity (you can also use `EMAIL_FROM`). | `MiniCourse <no-reply@example.com>` |

### Client variables (`client/.env`)

| Variable | Description | Example |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Fully qualified backend URL including the `/api` prefix. | `http://localhost:5000/api` |

Additional optional variables are available in `server/src/config/env.js` if you need to tweak password resets, email toggles, or Razorpay defaults.

## Installation

Install dependencies for both the client and server:

```bash
cd server
npm install

cd ../client
npm install
```

## Running the Project

Start the backend API:

```bash
cd server
npm run dev
```

Start the frontend client in a separate terminal:

```bash
cd client
npm run dev
```

The frontend is available at `http://localhost:5173` by default and proxies API calls to the Express backend (`/api`).

## Validation & Error Handling

- Backend requests are validated with Zod schemas (see `server/src/validation`). Invalid payloads short-circuit with `422` responses that include field-level detail.
- A global error middleware (`server/src/middleware/errorMiddleware.js`) normalizes responses and logs unexpected errors while exposing stack traces only outside production.
- Axios response interceptors normalize API failures on the client so toasts/modals can present consistent messages across login, signup, course management, and checkout flows.

## Razorpay Flow

1. The client requests `/api/orders` with a course ID to create an order.
2. The server validates the request, prevents duplicate purchases, creates a Razorpay order, persists the order metadata, and returns checkout credentials.
3. The React client loads the Razorpay SDK on demand, opens the checkout modal, and forwards the `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature` back to `/api/orders/verify`.
4. The backend verifies the signature, marks the order as paid, and responds with the updated order details.
5. (Optional) Configure a Razorpay webhook pointing to `/api/orders/webhook/razorpay` to reconcile asynchronous events such as payment captures or failures. Remember to use the raw request payload when testing webhooks locally.

## Email Workflow

After a successful payment verification the backend dispatches a SendGrid email summarizing the transaction. The response includes `email.dispatched`/`email.error` flags, enabling the frontend to notify users when delivery fails (e.g. due to unverified sender or API key permissions).

## What’s Working

- End-to-end course purchase: catalog → checkout → Razorpay capture → billing summary → confirmation email.
- Admin lifecycle for courses (create, update, delete) with validation guards and UX feedback.
- Auth flows (signup, login, password reset) with secure token issuance and contextual messaging.
- Global error visibility via toast notifications, including payment verification edge cases and SendGrid delivery errors.

## Quality Gates

- Frontend: `npm run build` (executed from the `client` directory)
- Backend: start the server with `npm run dev` or `npm start` after setting environment variables.

## Notes

- The Razorpay SDK loads only when a user initiates a checkout to keep the bundle size small.
- Order documents now capture provider metadata (`razorpayOrderId`, `razorpayPaymentId`, signatures, and payment timestamps) and support `pending`, `paid`, and `failed` statuses.
- Webhook requests rely on the raw request body. Express captures it through a custom `verify` callback in `server/src/app.js`.
- SendGrid credentials are initialized lazily; Forbidden responses surface actionable remediation tips in logs and API responses.
