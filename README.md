# CampusConnect

Full-stack campus platform for student life: placements, marketplace, accommodations, study tooling, and an AI-assisted career counselor.

## Core features

- **Job portal** — Browse internships and part-time roles, apply with CV upload, and track application status.
- **Admin hiring console** — Review applications grouped by company; separate **internship** vs **part-time** queues; filter by **job category** and status; approve or reject with API persistence where applicable.
- **Student dashboard** — Dashboard layout with quick actions, events, trending content, and part-time job cards.
- **AI career counselor** — Google Gemini-backed chat grounded in live job listings, with a safe fallback when the API is unavailable or over quota (useful for demos).
- **Marketplace** — Student item listings and service shops with admin moderation.
- **Accommodations & chat** — Listings and messaging between students and owners.
- **Time management** — Assignments, study sessions, and exams scoped to the logged-in user.
- **Q&A forum** — Category-tagged questions for peer support.

## Tech stack

| Layer | Technologies |
|--------|----------------|
| **Frontend** | React 18, Vite 7, React Router 7, Tailwind CSS, Framer Motion, Lucide React, Socket.io client, Axios |
| **Backend** | Node.js, Express, MongoDB (Mongoose), CORS, Multer (file uploads) |
| **AI** | Google Gemini API (`GEMINI_API_KEY`) for the career counselor |

## Repository layout

- `frontend/` — Vite + React SPA (`npm run dev`, `npm run build`).
- `backend/` — Express API (`server.js`), controllers, Mongoose models, and `uploads/` for user files (keep this directory out of version control for production data).

## Prerequisites

- **Node.js** 18+ recommended  
- **MongoDB** (Atlas URI or local instance)

## Environment variables

### Backend (`backend/.env`)

Create a `.env` file next to `server.js`. Example keys (names may match your team’s existing setup):

```env
PORT=5000
MONGO_URI=mongodb+srv://USER:PASSWORD@cluster.example.mongodb.net/campusconnect
JWT_SECRET=use_a_long_random_string
GEMINI_API_KEY=your_google_ai_studio_key
```

Without `GEMINI_API_KEY`, the AI counselor route still responds using the built-in presentation fallback.

### Frontend (`frontend/.env` or `.env.local`)

For non-localhost deployments, set the API origin (see `frontend/src/utils/apiBase.ts`):

```env
VITE_API_URL=https://your-api.example.com
```

On `localhost`, the app defaults to `http://localhost:5000` unless overridden.

## Run locally

**Backend** — from the `backend` folder, install dependencies (add a `package.json` if your fork uses one), then start:

```bash
cd backend
node server.js
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

## Optional: seed data

If your clone includes `backend/seed.js`, run it once to create a default admin user. Check that file for the exact email and password printed to the console.
