# Phase 6: Emergency SOS + Real-Time Dispatch

This phase adds a real-time emergency workflow, including:

- SOS page with GPS-based emergency alert activation
- Live incident map using OpenStreetMap tiles
- Nearby hospital discovery and distance ranking
- Socket.IO powered real-time event updates
- Responder dashboard with emergency analytics and status management
- Emergency alert notifications and status broadcasting

## Key files

- `frontend/app/emergency/page.tsx` — user-facing SOS workflow
- `frontend/components/EmergencySOS.tsx` — SOS form + location + hospital discovery
- `frontend/components/EmergencyResponderDashboard.tsx` — real-time responder dashboard
- `frontend/components/EmergencyMap.tsx` — shared OpenStreetMap-based map view
- `backend/src/server.ts` — Socket.IO, emergency APIs, hospital discovery, analytics

## Notes

- Uses browser geolocation for live SOS coordinates.
- Uses internal emergency analytics endpoints for response tracking.
- Uses a simple static hospital catalog in the backend for nearby discovery.
