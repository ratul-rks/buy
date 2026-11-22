# Copilot instructions — Orebi Shopping (E-commerce)

Purpose: Give an AI coding agent the minimal, actionable context to be productive in this repository.

- **Big picture**: This repo is a full-stack e‑commerce app with three primary pieces:
  - `client/` — customer-facing React app (Vite + Tailwind).
  - `admin/` — admin panel React app (Vite + Tailwind + Redux).
  - `server/` — Node.js/Express API (ES modules, many files use `.mjs`).

- **How the backend is organized**:
  - Routes are auto-loaded from `server/routes/` by `server/index.mjs` — each route file should default-export an Express router.
  - Business logic lives in `server/controllers/`, data models in `server/models/`, and middleware in `server/middleware/`.
  - Mongoose is used for DB access; Cloudinary is used for image uploads; Stripe for payments.

- **Run & development commands** (examples):
  - Backend (development): `cd server && npm run dev` (uses `nodemon`, NODE_ENV=development).
  - Backend (production): `cd server && npm run start`.
  - Frontend (client): `cd client && npm run dev`.
  - Frontend (admin): `cd admin && npm run dev`.

- **Important environment variables** (see `server/config/*` for usage):
  - `MONGO_URI` — MongoDB connection string (`server/config/mongodb.js`).
  - `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_SECRET_KEY` (`server/config/cloudinary.js`).
  - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (`server/controllers/paymentController.js`).
  - `JWT_SECRET` — required by `server/middleware/userAuth.js` and `adminAuth.js`.
  - `ADMIN_URL`, `CLIENT_URL`, `PORT`, `NODE_ENV` — referenced in `server/index.mjs`.
  - Optional bootstrap values: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` (`server/createAdmin.mjs`).

- **Project-specific conventions & patterns**:
  - Many server files use the `.mjs` extension and ES module imports; keep consistent module style.
  - Route files export a default router and are loaded automatically by `server/index.mjs`.
  - File uploads: Cloudinary integration + `server/middleware/multer.mjs` and `avatarUpload.mjs` — prefer using those helpers for uploads and deletions.
  - Auth: `userAuth.js` and `adminAuth.js` are the canonical middleware for protected routes; they expect JWT in `Authorization` header.
  - Redux: admin/client use `@reduxjs/toolkit` and slices live under `src/redux` (e.g., `admin/src/redux/authSlice.js`).
  - Frontend bundling: Vite dev servers run on default ports (commonly 5173/5174) — CORS is configured in `server/index.mjs` and uses `ADMIN_URL`/`CLIENT_URL`.

- **Integration points to be careful with**:
  - Webhooks: Stripe webhook signing uses `STRIPE_WEBHOOK_SECRET` — local testing requires exposing the server (e.g., `ngrok`) or disabling strict webhook checks for dev.
  - Cloudinary public_id parsing: `server/config/cloudinary.js` contains helpers to extract `public_id` from a URL — use that utility when deleting images.
  - Automatic route loader: adding/removing files in `server/routes/` affects server routing at startup.

- **Where to look for common tasks/examples**:
  - Loadable route pattern: [server/index.mjs](server/index.mjs#L1)
  - DB connect: [server/config/mongodb.js](server/config/mongodb.js#L1)
  - Cloudinary helpers: [server/config/cloudinary.js](server/config/cloudinary.js#L1)
  - Auth middleware: [server/middleware/userAuth.js](server/middleware/userAuth.js#L1) and [server/middleware/adminAuth.js](server/middleware/adminAuth.js#L1)
  - Payment integration: [server/controllers/paymentController.js](server/controllers/paymentController.js#L1)

- **When editing code**:
  - Preserve `.mjs`/ES module style on the server side; avoid mixing CommonJS `require` in `.mjs` files.
  - Update both `client` and `admin` when API changes affect UI contracts (they are separate apps with similar conventions).
  - Follow existing Tailwind and ESLint setups: configs are in each app root (`admin/eslint.config.js`, `client/` and `admin/tailwind.config.js`).

If anything is unclear or you want more detail in a specific area (build scripts, CI, or common PR patterns), tell me which area to expand.
