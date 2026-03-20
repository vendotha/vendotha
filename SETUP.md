# Buvananand Portfolio — Complete Setup Guide

## Architecture
```
frontend/ (React + Vite)  →  backend/ (FastAPI)  →  Neon Postgres
   Vercel (free)               Render (free)          Neon (free)
```
Firebase is used for Google Sign-In only — no Firestore, no Storage.
Everything (profile, skills, experience, posts, DP, resume) lives in Neon Postgres.

---

## Step 1 — Neon Postgres (Database)

1. Go to https://neon.tech and sign up (free, no credit card)
2. Create a new project → name it `portfolio`
3. On the dashboard, copy the **Connection string** — looks like:
   `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`
4. Paste it as `DATABASE_URL` in `backend/.env`

The database tables are created **automatically** when the backend starts for the first time.
Your real data (profile, skills, experience, posts) is seeded automatically too.

---

## Step 2 — Firebase (Google Auth only)

1. Go to https://console.firebase.google.com
2. Create a project → Add a **Web app** → copy the config
3. Go to **Authentication → Sign-in method → Enable Google**
4. Add `localhost` and your Vercel URL to **Authorized domains**
5. Fill in `backend/.env` with `FIREBASE_PROJECT_ID`
6. Fill in `frontend/.env` with all `VITE_FIREBASE_*` values

---

## Step 3 — Backend on Render

1. Push the `backend/` folder to a GitHub repo (can be the same repo)
2. Go to https://render.com → New → **Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Root directory:** `backend`
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free
5. Add environment variables:
   - `DATABASE_URL` — your Neon connection string
   - `FIREBASE_PROJECT_ID` — your Firebase project ID
   - `ADMIN_EMAIL` — `vendotha@gmail.com`
   - `FRONTEND_URL` — your Vercel URL (add after frontend deploy)
6. Deploy → copy your Render URL (e.g. `https://portfolio-api.onrender.com`)

> **Note:** Render free tier sleeps after 15 min of inactivity. First request after sleep takes ~30s. This is fine for a portfolio.

---

## Step 4 — Frontend on Vercel

1. Push `frontend/` to GitHub
2. Go to https://vercel.com → New Project → Import repo
3. Settings:
   - **Root directory:** `frontend`
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
4. Add environment variables:
   - `VITE_API_URL` — your Render URL from Step 3
   - `VITE_FIREBASE_API_KEY` — from Firebase
   - `VITE_FIREBASE_AUTH_DOMAIN` — from Firebase
   - `VITE_FIREBASE_PROJECT_ID` — from Firebase
   - `VITE_FIREBASE_MESSAGING_SENDER_ID` — from Firebase
   - `VITE_FIREBASE_APP_ID` — from Firebase
   - `VITE_ADMIN_EMAIL` — `vendotha@gmail.com`
5. Deploy → copy your Vercel URL
6. Go back to Render → update `FRONTEND_URL` with your Vercel URL
7. Go back to Firebase → add your Vercel URL to Authorized domains

---

## Step 5 — Add your DP and Resume

**Option A — Via Admin panel (easiest):**
1. Go to `your-site.vercel.app/admin`
2. Sign in with `vendotha@gmail.com`
3. Upload DP and Resume PDF directly

**Option B — Static files:**
Place `public/dp.jpg` and `public/resume.pdf` in the frontend folder before deploying.

---

## Running Locally

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # fill in your values
uvicorn main:app --reload
# API runs at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env       # set VITE_API_URL=http://localhost:8000
npm run dev
# Site at http://localhost:5173
# Admin at http://localhost:5173/admin
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/profile` | Public | Get profile data + DP as base64 |
| PUT | `/api/profile` | Admin | Update profile, upload DP/resume |
| GET | `/api/resume` | Public | Download resume PDF |
| GET | `/api/skills` | Public | Get skill categories |
| PUT | `/api/skills` | Admin | Replace all skills |
| GET | `/api/experience` | Public | Get experience list |
| PUT | `/api/experience` | Admin | Replace all experience entries |
| GET | `/api/posts` | Public | Get all posts (images as base64) |
| POST | `/api/posts` | Admin | Create new post |
| PUT | `/api/posts/{id}` | Admin | Update post |
| DELETE | `/api/posts/{id}` | Admin | Delete post |

Interactive docs available at `your-render-url.onrender.com/docs`

---

## What auto-syncs
| Content | How |
|---------|-----|
| GitHub projects | GitHub REST API — live on every page load |
| Everything else | Stored in Neon Postgres, fetched from FastAPI |
| DP & Resume | Stored as bytes in Postgres, served via `/api/profile` and `/api/resume` |
| Admin changes | Hit FastAPI instantly — no rebuild needed |
