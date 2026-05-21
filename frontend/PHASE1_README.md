# ArogyaAI — Phase 1: Foundation & Frontend Architecture

This folder contains the Phase 1 frontend scaffold for ArogyaAI.

Delivered:
- Next.js 15 App Router + TypeScript
- Tailwind CSS with Bharat healthcare theme tokens
- Framer Motion mobile navigation
- App layout with `NavBar` and `Sidebar`
- Reusable UI primitives: `Button`, `Card`, `Input`
- Accessible, mobile-first responsive design system

How to run (development):

```bash
# from project root
npm install
npm run dev
```

Notes & next steps:
- Wire frontend diagnosis form to backend API and add loading/error/empty states.
- Implement i18n scaffolding and language resource files.
- Add offline PWA service worker and local-first persistence for records.
- Integrate shadcn/ui components and theming tokens for richer components.
- Add automated linting and CI pipeline.

Design principles applied:
- Mobile-first and accessible layouts
- Reusable components and strict TypeScript types
- Healthcare-first visual language (green palette, soft glassmorphism)
