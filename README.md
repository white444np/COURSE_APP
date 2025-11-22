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

Create a `.env` file inside the `server` directory (the config loader resolves `server/.env` from `server/src/config/env.js`). The following variables are required for a fully functional environment:

| Variable | Description |
| --- | --- |
| `PORT` | Port for the backend server (defaults to `5000`). |
| `MONGO_URI` | Connection string for MongoDB. |
| `JWT_SECRET` | Secret used to sign authentication tokens. |
| `CLIENT_URL` | Base URL of the frontend (used when constructing reset links). |
| `RAZORPAY_KEY_ID` | Public Razorpay key used on the client to initialize the checkout. |
| `RAZORPAY_KEY_SECRET` | Private Razorpay key used on the server to create and verify orders. |
| `RAZORPAY_WEBHOOK_SECRET` | Secret for validating webhook signatures (optional but recommended). |
| `RAZORPAY_CURRENCY` | Currency code for orders (defaults to `INR`). |
| `SENDGRID_API_KEY` | SendGrid API key with “Mail Send” scope. |
| `SENDGRID_FROM` | Verified sender identity for transactional emails (e.g. `MiniCourse <no-reply@minicourse.dev>`). |

Additional optional variables are available in `server/src/config/env.js` for password resets, admin bootstrap credentials, and environment toggles.

## Installation

Install dependencies for both the client and server:

```powershell
cd server
npm install

cd ..\client
npm install
```

## Running the Project

Start the backend API:

```powershell
cd server
npm run dev
```

Start the frontend client in a separate terminal:

```powershell
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
