# ArogyaAI Phase 4 — Frontend AI Workflows

This folder now includes the completed Phase 4 AI workflow UI for ArogyaAI.

## New Features
- `/ai` route for the AI healthcare assistant
- Symptom analysis with `/api/ai/analyze-symptoms`
- Emergency detection with `/api/ai/detect-emergency`
- Health risk assessment with `/api/ai/risk-assessment`
- Medication recommendations with `/api/ai/medication-recommendations`
- Multilingual healthcare assistant chat with `/api/ai/assistant`
- Wellness report viewer with `/api/ai/wellness-report/:userId`
- Assistant answer notifications surfaced through the patient dashboard

## Added frontend components
- `components/AIWorkflow.tsx`
- `components/EmergencyForm.tsx`
- `components/RiskAssessmentForm.tsx`
- `components/MedicationForm.tsx`
- `components/AssistantChat.tsx`
- `components/WellnessReport.tsx`

## Notes
- The AI page requires authentication and uses the current session user ID.
- If the backend runs on a different origin, set `NEXT_PUBLIC_API_BASE_URL` to the backend host.
- Build verified successfully with `npm run build`.
