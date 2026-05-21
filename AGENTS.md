# ArogyaAI Agent Guide

## Purpose
This repository contains a split project:
- `backend/` — Node.js + Express + TypeScript backend using Mongoose, MongoDB, and AI services.
- `frontend/` — Next.js 15 + React frontend with Tailwind CSS, NextAuth authentication, Leaflet maps, and Socket.IO.

## What agents should know
- There is no top-level `package.json`; each service is independent.
- Backend is ESM-based (`type: module`) and uses `tsx` for development.
- Frontend is a Next.js App Router app located in `frontend/app/`.
- Environment configuration is expected in `backend/.env.example` and frontend may also use Next.js env vars.

## Key commands
### Backend
- `cd backend && npm run dev` — run backend in watch mode.
- `cd backend && npm run build` — compile TypeScript.
- `cd backend && npm run start` — start production backend.
- `cd backend && npm run seed` — seed the database.
- `cd backend && npm run lint` — lint backend source.
- `cd backend && npm run type-check` — run TypeScript checks.

### Frontend
- `cd frontend && npm run dev` — run the Next.js frontend.
- `cd frontend && npm run build` — build the frontend.
- `cd frontend && npm run start` — serve the built frontend.
- `cd frontend && npm run lint` — lint frontend source.

## Architecture notes
- Backend: source under `backend/src/`.
  - `src/models/` contains Mongoose schemas.
  - `src/services/` contains AI and hospital integration logic.
  - `src/config/database.ts` and `src/utils/db.ts` handle MongoDB connection.
  - `src/server.ts` is the backend entry point.
- Frontend: source under `frontend/app/` and `frontend/components/`.
  - `app/` contains pages and route segments.
  - `components/` holds reusable UI and domain-specific screens.
  - `lib/auth/` contains NextAuth config, role helpers, and user utilities.

## Conventions
- Keep backend imports in ESM style (`import ... from ...`).
- Preserve Next.js App Router conventions for `page.tsx` and route folders.
- Follow Tailwind CSS conventions in `frontend/styles/globals.css` and component classes.
- Use existing service patterns for AI integrations and socket-based features.

## Existing docs
- `backend/PHASE3_README.md`
- `backend/PHASE4_README.md`
- `frontend/PHASE1_README.md`
- `frontend/PHASE2_README.md`
- `frontend/PHASE4_README.md`
- `frontend/PHASE5_README.md`
- `frontend/PHASE6_README.md`

## When making changes
- Prefer small, targeted edits and keep changes aligned with the existing backend/frontend separation.
- Do not assume a monorepo root build; use each package’s own scripts.
- Keep variable and component names consistent with the healthcare/AI domain in this app.
