# Digital Heroes Platform

A modern subscription-driven web application combining personal performance tracking, charity fundraising, and community rewards.

## Tech Stack
- **Frontend**: React (Vite), Axios, Lucide React, React Router
- **Backend**: FastAPI, SQLAlchemy, JWT, SQLite (local) / PostgreSQL (production)
- **Styling**: Vanilla CSS with modern glassmorphic design

## Quick Start

### Backend
1. `cd backend`
2. `python -m venv venv`
3. `source venv/bin/activate` (or `venv\Scripts\activate` on Windows)
4. `pip install -r requirements.txt`
5. `uvicorn app.main:app --reload`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Test Credentials
- **Admin**: `admin@hero.com` / `admin123`
- **User**: `user@hero.com` / `password123`

## Core Features
- **Hero Dashboard**: Track scores and view your subscription status.
- **Charity Engine**: Interactive charity selection that directs a portion of subscriptions to causes.
- **Admin Nexus**: Powerful management panel for running draws, viewing user directories, and tracking global impact.
- **Security**: Role-based access control and JWT-based authentication.

## Deployment Tips
- **Frontend**: Vercel (connect GitHub repo, use `npm run build`, output: `dist`).
- **Backend**: Render or Railway (use `uvicorn app.main:app --host 0.0.0.0 --port $PORT`).
- **Database**: Easily switch to Supabase/PostgreSQL by updating the `DATABASE_URL` in `.env`.
