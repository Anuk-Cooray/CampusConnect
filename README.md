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
