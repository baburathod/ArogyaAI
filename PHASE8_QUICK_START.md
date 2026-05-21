# Phase 8 Quick Start Guide

## Local Development Setup

### Prerequisites
- Node.js 18+ installed
- MongoDB 5+ running (local or Atlas)
- Git installed

### 1. Clone and Install Dependencies

```bash
cd ArogyaAI
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Environment Variables

**Backend** (`backend/.env`):
```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/arogya?retryWrites=true&w=majority
PORT=3000
JWT_SECRET=your-secret-key-here
CORS_ORIGINS=http://localhost:3000
NODE_ENV=development
```

**Frontend** (`frontend/.env.local`):
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=test-secret-key
BACKEND_URL=http://localhost:3000
```

### 3. Seed the Database

```bash
cd backend
npm run seed
# Output: ✅ Database seeding completed!
```

**Test Users Created:**
- Patient: `rajesh@arogya.ai` / `PatientPass123!`
- Doctor: `priya@arogya.ai` / `DoctorPass123!`
- Responder: `amit@arogya.ai` / `ResponderPass123!`
- Admin: `anitha@arogya.ai` / `AdminPass123!`

### 4. Start Backend Server

**Terminal 1:**
```bash
cd backend
npm run dev
# Output: ✓ Express running on http://localhost:3000
```

### 5. Start Frontend

**Terminal 2:**
```bash
cd frontend
npm run dev
# Output: ▲ Next.js started on http://localhost:3000
```

### 6. Start Offline Queue Worker (Optional)

**Terminal 3:**
```bash
cd backend
npm run offline-worker
# Output: Offline queue worker started
```

---

## Testing Workflows

### Run All Tests

```bash
# Backend unit tests
cd backend && npm run test:run

# Frontend unit tests
cd frontend && npm run test:run

# E2E tests (requires running frontend + backend)
cd frontend && npm run e2e

# E2E with UI (visual mode)
cd frontend && npm run e2e:headed
```

### Expected Results
```
✓ Backend tests: 19 passed
✓ Frontend unit tests: 2 passed
✓ E2E tests: 2 passed
```

---

## Manual Testing Guide

### 1. Test Patient Login & Offline

1. Open http://localhost:3000
2. Click "Sign in"
3. Enter: `rajesh@arogya.ai` / `PatientPass123!`
4. Navigate to **Dashboard** — you'll see:
   - Health Score Card
   - Symptom Trends Chart
   - Medicine Reminder
   - Appointments Overview
   - Offline Indicator

5. **Test Offline Mode:**
   - Open DevTools (F12)
   - Go to Network tab
   - Check "Offline"
   - Dashboard remains visible (offline-first)
   - Try clicking "Mark as Taken" on a medicine (queued locally)
   - Uncheck "Offline" — queue replays to server

### 2. Test Medication Sync

**Create a medication entry offline:**
```javascript
// In DevTools console:
const queue = [{
  type: 'medication-taken',
  payload: { medId: 'test', name: 'Aspirin', takenAt: new Date().toISOString() }
}];
localStorage.setItem('offlineQueue', JSON.stringify(queue));
```

**Verify server receives it:**
```bash
curl -X POST http://localhost:3000/api/medications/taken \
  -H "Content-Type: application/json" \
  -d '{"medId":"test","name":"Aspirin","takenAt":"2025-01-18T12:00:00Z"}'
```

### 3. Test Emergency Response

1. Login as **responder** (`amit@arogya.ai` / `ResponderPass123!`)
2. Navigate to **Emergency Dashboard**
3. You'll see:
   - Active emergency list
   - Responder assignment controls
   - Real-time Socket.IO updates

---

## Common Commands

```bash
# Backend
npm run dev          # Start dev server (watch mode)
npm run build        # Compile TypeScript
npm run start        # Start production server
npm run seed         # Seed test data
npm run offline-worker  # Start queue processor
npm run test:run     # Run unit tests
npm run lint         # Lint source
npm run type-check   # Type check

# Frontend
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run start        # Start production server
npm run test:run     # Run unit tests
npm run e2e          # Run E2E tests (headless)
npm run e2e:headed   # Run E2E tests (with UI)
npm run lint         # Lint source
```

---

## Troubleshooting

### "MongoDB connection failed"
- Verify `MONGODB_URI` in `.env`
- Check MongoDB Atlas firewall IP whitelist
- Ensure cluster is running

### "NextAuth Configuration error"
- Set `NEXTAUTH_SECRET` in `frontend/.env.local`
- Set `NEXTAUTH_URL` to http://localhost:3000

### "Port 3000 already in use"
- Kill existing process: `lsof -ti:3000 | xargs kill`
- Or use different port: `PORT=3001 npm run dev`

### "E2E tests timeout"
- Ensure both backend and frontend are running
- Clear browser cache: `rm -rf frontend/.next`
- Run with extra time: `npm run e2e -- --timeout=60000`

### "Offline queue not processing"
- Check offline-worker is running: `npm run offline-worker`
- Verify MongoDB connection from worker
- Check logs for error messages

---

## API Endpoints Reference

### Auth
```
POST /api/auth/login          # Login (email, password)
POST /api/auth/signup         # Register new user (frontend)
```

### Offline Sync
```
POST /api/offline/medications         # Queue medication event
POST /api/medications/taken           # Direct medication sync
POST /api/offline/appointments        # Queue appointment
```

### Analytics
```
GET /api/analytics/symptoms           # Symptom trend data
```

### Health Records
```
GET /api/health-records/:userId       # User's health history
POST /api/health-records              # Create new record
GET /api/health-records/:userId/latest # Latest vitals
```

### Emergencies
```
POST /api/emergencies/sos             # Trigger SOS (authenticated)
GET /api/emergencies/active           # Active emergencies
GET /api/emergencies/nearby            # Nearby emergencies
POST /api/emergencies/:id/assign       # Assign responder
POST /api/emergencies/:id/respond      # Update emergency status
```

### Health & Status
```
GET /api/health                       # Server health check
GET /api/stats                        # Dashboard stats
```

---

## File Structure

```
ArogyaAI/
├── backend/
│   ├── src/
│   │   ├── server.ts               # Main Express server
│   │   ├── config/database.ts      # MongoDB connection
│   │   ├── models/                 # Mongoose schemas
│   │   ├── services/               # Business logic
│   │   ├── utils/db.ts             # Database utilities
│   │   ├── queue/offline-worker.ts # Offline processor
│   │   └── tests/                  # Unit tests
│   ├── package.json                # Dependencies
│   └── tsconfig.json               # TypeScript config
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx                # Home page
│   │   ├── auth/                   # Auth routes
│   │   └── dashboard/              # Role-based dashboards
│   ├── components/
│   │   ├── dashboard/              # Dashboard widgets
│   │   ├── ui/                     # Base UI components
│   │   └── navigation/             # Nav components
│   ├── lib/
│   │   ├── auth/                   # NextAuth config
│   │   └── offlineStore.ts         # Offline persistence
│   ├── e2e/
│   │   ├── tests/                  # Playwright tests
│   │   └── playwright.config.ts    # Test config
│   ├── public/sw.js                # Service worker
│   ├── package.json
│   └── next.config.js
│
└── .github/workflows/ci.yml        # GitHub Actions
```

---

## Next Steps

1. **Local Development:** Follow setup steps above
2. **Run Tests:** Execute all test commands
3. **Manual Testing:** Use testing guide
4. **Make Changes:** Backend code in `src/`, Frontend code in `app/` and `components/`
5. **Commit:** Push to `main` or `master` — CI runs automatically

---

## Support

For issues or questions:
1. Check logs in terminal output
2. Review error messages in browser console (F12)
3. Check `.env` file configuration
4. Verify MongoDB connection
5. Review test results

---

**Happy coding! 🚀**
