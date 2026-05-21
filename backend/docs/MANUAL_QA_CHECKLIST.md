# Manual QA Checklist — Phase 6 Emergency SOS

Use this checklist for end-to-end real-time testing across devices.

## Prerequisites

- Backend running: `cd backend && npm run dev`
- Frontend running: `cd frontend && npm run dev`
- Two browsers/devices or two browser tabs
- Network connectivity between caller and responder

## Test 1: SOS User Flow

**Device A (Caller)**

- [ ] Open `http://localhost:3000` (or your frontend URL)
- [ ] Navigate to **Emergency / SOS**
- [ ] Grant location permission (or manually enter lat/lon: **12.9716, 77.5946**)
- [ ] Enter symptoms: "chest pain" or similar
- [ ] Click **Send SOS**
- [ ] Confirm success message appears
- [ ] Verify map shows your location with a red pin

**Device B (Responder)**

- [ ] Open `http://localhost:3000` in another browser/device
- [ ] Navigate to **Dashboard / Emergency Responder**
- [ ] Confirm you see the SOS emergency from Device A in the **Active Emergencies** list
- [ ] Verify map shows the emergency pin at correct location
- [ ] Check that responders dropdown lists available responders

## Test 2: Responder Assignment

**Device B (Responder Dashboard)**

- [ ] From the Active Emergencies list, click the emergency created by Device A
- [ ] Emergency details panel should expand showing symptoms, location, and map
- [ ] Click **Respond** to signal willingness to help
- [ ] Select a responder from the **Assign Responder** dropdown
- [ ] Click **Assign**
- [ ] Confirm success message appears

**Device A (SOS Caller)**

- [ ] Verify a notification appears: "Responder assigned: [Name]"
- [ ] Confirm responder details (name, location) are displayed
- [ ] Verify responder's location is shown on the map

## Test 3: Real-Time Socket Events

**Both Devices**

- [ ] Open browser DevTools → Console
- [ ] Look for socket connection messages:
  - `[Socket.IO] connect` or similar on page load
  - No red error messages in console
- [ ] Check that events are being received (may see debug logs if enabled)

**Trigger events:**

- [ ] Create a new SOS on Device A
- [ ] Check Device B console for `emergency:created` or similar event logs
- [ ] Device B responder dashboard should refresh automatically (no page reload needed)

## Test 4: Hospital Lookup

**Either Device**

- [ ] On the **Emergency SOS** or responder dashboard, verify a **Nearby Hospitals** section is visible
- [ ] Check that at least 3–5 hospitals are listed within 15 km
- [ ] Verify hospital names, addresses, and distances are displayed
- [ ] Click a hospital name; confirm map zooms to its location

## Test 5: Authentication & Token

**Device A or B (With Active Session)**

- [ ] Log in with a valid user account (if required)
- [ ] On responder dashboard, scroll to the **Token (debug)** panel on the right
- [ ] Verify a JWT token is displayed
- [ ] Click **Copy token** and paste into a notepad to confirm it's a valid JWT (3 dot-separated parts)
- [ ] If logged out, verify token disappears

## Test 6: Rate Limiting & Error Handling

**Device B (Responder)**

- [ ] Rapidly click **Assign** or refresh the dashboard multiple times in quick succession
- [ ] Within 1–2 minutes, you may see a **429 Too Many Requests** error (rate limit)
- [ ] Wait 1 minute and try again; request should succeed
- [ ] This confirms rate limiting is active

**Either Device**

- [ ] Disconnect internet briefly (toggle airplane mode or dev tools throttle)
- [ ] Try to send an SOS or view dashboard
- [ ] Confirm graceful error message (e.g., "Connection lost. Please try again.")
- [ ] Reconnect; confirm functionality resumes without page reload

## Test 7: Cross-Device Communication

**Device A (Caller) + Device B (Responder) + Device C (Optional 2nd Responder)**

- [ ] Open three separate browser windows/tabs or devices
- [ ] On Device A: Send SOS
- [ ] On Device B: Confirm emergency received in real-time (no refresh needed)
- [ ] On Device C: Confirm same emergency appears (both responders see it)
- [ ] On Device B: Assign responder (ID: "test-responder-1")
- [ ] On Device C: Confirm event does **not** appear there (assignment is targeted)
- [ ] On Device B: Confirm responder receives **emergency:assigned** event

## Test 8: UI/UX Expectations

**General**

- [ ] All text is readable; no console errors in DevTools
- [ ] Buttons are clickable and give visual feedback (hover, active states)
- [ ] Maps load and are interactive (zoom, pan)
- [ ] Forms validate (e.g., can't submit empty SOS without location)
- [ ] Loading spinners appear during API calls
- [ ] Success/error toast messages are clear and dismissable

**Mobile (if applicable)**

- [ ] Layout is responsive on small screens (< 768px width)
- [ ] Touch interactions work (buttons, map, dropdowns)
- [ ] No horizontal scroll needed

## Known Limitations (Acceptable for Phase 6)

- ⚠️ External hospital API requires `BACKEND_HOSPITALS_API` env var; without it, local hospital list is used
- ⚠️ Real-time notifications use Socket.IO rooms; offline users won't receive events until they reconnect
- ⚠️ JWT token is not auto-refreshed; session expires after `exp` time

## Failure Modes to Watch For

| Symptom | Likely Cause | Action |
|---------|--------------|--------|
| **Socket events don't appear** | Backend Socket.IO not running or CORS blocked | Check backend console; restart with `npm run dev` |
| **Hospitals return empty list** | `BACKEND_HOSPITALS_API` not set + no local DB seed | Seed local hospitals or provide external API URL |
| **"Not authorized" on responder dashboard** | JWT token not in session | Log in again; check `NextAuth.js` callback |
| **Rate limit error immediately** | API rate limiter too strict or clock skew | Check `API_RATE_LIMIT` env var; see `/backend/.env` |
| **Map not loading** | Leaflet/maps JS not included | Check frontend build; verify `npm run build` succeeded |

## Automated Tests

Instead of manual QA, you can also run the automated E2E test harness:

```bash
cd backend
npm run e2e-test
```

Or via CI (GitHub Actions):

```bash
git push  # triggers .github/workflows/ci.yml
# Check Actions tab for results
```

---

**Test Completion:** If all 8 tests pass with no critical failures, Phase 6 is ready for staging/production.
