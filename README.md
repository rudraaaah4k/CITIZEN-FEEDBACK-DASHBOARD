# CivicPulse — Citizen Feedback Analysis Dashboard

An AI-powered, full-stack Citizen Feedback Analysis Dashboard. Citizens submit feedback (with photos/PDFs,
location, priority, and optional anonymity); a free, rule-based NLP engine analyzes sentiment, emotion,
urgency, spam and topic in real time; admins triage, resolve, and export analytics-rich reports.

Built as a portfolio-grade / university major project reference implementation.

---

## Tech Stack

**Frontend:** React 19 · Vite · TypeScript · TailwindCSS · Framer Motion · React Router · Zustand ·
React Hook Form + Zod · Axios · TanStack Query · Chart.js / react-chartjs-2 · Lucide Icons · Radix primitives

**Backend:** Node.js · Express · MongoDB · Mongoose · JWT (access + refresh tokens) · Role-based auth ·
`natural` (free, local NLP — no external API keys)

**Deployment:** Frontend → Vercel · Backend → Render · Database → MongoDB Atlas

---

## Project Structure

```
.
├── backend/                 # Express + MongoDB API
│   └── src/
│       ├── config/          # DB, JWT, multer config
│       ├── controllers/     # Route handlers
│       ├── middleware/      # auth, validation, rate limiting, error handling
│       ├── models/          # Mongoose schemas (User, Feedback, Department, Category, Notification, Report, Settings)
│       ├── routes/          # Express routers
│       ├── services/        # aiService.ts — free NLP analysis engine
│       └── utils/           # logger, email, response helpers, seeder
└── frontend/                 # React + Vite SPA
    └── src/
        ├── components/       # ui/, layout/, shared/, charts/
        ├── hooks/             # TanStack Query hooks per domain
        ├── pages/             # public/, auth/, citizen/, admin/
        ├── services/          # Axios API layer
        ├── stores/            # Zustand auth + UI stores
        └── types/             # Shared TypeScript types
```

---

## Getting Started

### 1. Backend

```bash
cd backend
cp .env.example .env    # fill in MONGODB_URI, JWT secrets, SMTP creds, etc.
npm install
npm run seed             # optional: seeds departments, categories, an admin user & sample feedback
npm run dev               # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env    # set VITE_API_URL=http://localhost:5000/api/v1
npm install
npm run dev               # starts on http://localhost:5173
```

The Vite dev server also proxies `/api` to `http://localhost:5000` (see `vite.config.ts`), so either the
proxy or the explicit `VITE_API_URL` will work locally.

### 3. Default seeded admin (if you ran `npm run seed`)

```
email:    admin@citizenfeedback.gov
password: Admin@123456
```

---

## Google Services Setup

**Google Sign-In (OAuth):**
1. Create credentials at [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → OAuth 2.0 Client ID → Web application.
2. Add `http://localhost:5173` (and your production domain) to Authorized JavaScript origins.
3. Set `VITE_GOOGLE_CLIENT_ID` (frontend) and `GOOGLE_CLIENT_ID` (backend) to the same Client ID.

**Google Maps (location picker + complaint location display):**
1. In the same Google Cloud project, enable **Maps JavaScript API**, **Places API**, and **Geocoding API**.
2. Create an API key and restrict it to those three APIs (and to your domain(s) for production).
3. Set `VITE_GOOGLE_MAPS_API_KEY` in the frontend `.env`.
4. No backend key is needed — geocoding happens client-side and coordinates are sent to the API as part of the normal feedback submission.

If either key is left unset, the app degrades gracefully: the Google Sign-In button and the map picker simply don't render, and citizens can still register with email/password and type an address manually.

## AI Features (100% Free — No API Keys)

The `aiService.ts` engine runs entirely locally using the open-source `natural` NLP library:

- Sentiment analysis (positive / negative / neutral, with a numeric score)
- Emotion detection (joy, anger, fear, sadness, surprise, disgust)
- Keyword extraction (TF-IDF based)
- Topic classification (rule-based pattern matching across civic categories)
- Spam detection
- Urgency detection & scoring
- Language detection
- Auto-generated feedback summaries & recommendations

## Deployment

- **Frontend (Vercel):** import the `frontend/` directory as the project root, set `VITE_API_URL` to your
  deployed backend URL, and deploy. `vercel.json` already configures SPA rewrites and security headers.
- **Backend (Render):** `render.yaml` is a ready-to-use Render Blueprint. Set `MONGODB_URI`, `CLIENT_URL`,
  and SMTP secrets in the Render dashboard.
- **Database (MongoDB Atlas):** create a free cluster, whitelist Render's IPs (or `0.0.0.0/0` for simplicity),
  and use the connection string as `MONGODB_URI`.

## License

MIT — free to use for learning, portfolios, and coursework.
