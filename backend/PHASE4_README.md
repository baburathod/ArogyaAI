# ArogyaAI Phase 4 - AI Healthcare Workflows

## Overview
Phase 4 adds Gemini-powered AI healthcare intelligence to ArogyaAI.
The backend now supports:
- AI symptom analysis
- Emergency detection and alert creation
- Health risk scoring
- Multilingual healthcare assistant
- AI medication recommendation generation
- Wellness and population health reporting

## New Backend Services
- `backend/src/services/gemini.ts`
  - Integrates with Google Gemini AI via `@google/generative-ai`
  - Provides analysis methods: `analyzeSymptoms`, `detectEmergency`, `calculateRiskScore`, `getMultilingualResponse`, `getMedicationAdvice`
- `backend/src/services/ai-healthcare.ts`
  - Integrates Gemini output with MongoDB models
  - Creates `HealthRecord`, `Emergency`, and `Notification` records automatically
  - Provides user-facing operations for AI workflows
- `backend/src/utils/multilingual.ts`
  - Provides localized healthcare terms and severity formatting for English, Hindi, and Telugu

## New API Endpoints
- `POST /api/ai/analyze-symptoms`
  - Input: `userId`, `symptoms`, optional `duration`, `severity`, `medicalHistory`, `currentMedications`, `language`
  - Output: AI analysis, risk level, saved health record, optional notification
- `POST /api/ai/detect-emergency`
  - Input: `userId`, `symptoms`, optional `severity`, `vitalSigns`, `location`, `language`
  - Output: emergency detection flags, actions, saved emergency record if needed
- `POST /api/ai/risk-assessment`
  - Input: `userId`, `age`, `symptoms`, optional `severity`, `medicalHistory`, `vitalSigns`
  - Output: risk score, risk level, recommendations, saved health record
- `POST /api/ai/medication-recommendations`
  - Input: `userId`, `condition`, `symptoms`, optional `age`, `allergies`, `language`
  - Output: medication suggestions, lifestyle recommendations, saved prescription record
- `POST /api/ai/assistant`
  - Input: `userId`, `query`, `language`, optional `context`
  - Output: multilingual healthcare assistant response and disclaimer
  - Also generates a system notification with the assistant answer
- `GET /api/ai/wellness-report/:userId`
  - Output: recent health summary, risk score, pending alerts, recent conditions
- `GET /api/ai/population-health`
  - Output: aggregated population insights for recent diagnoses and critical emergencies

## Environment
Required environment variable:
- `GEMINI_API_KEY=your_gemini_api_key_here`

Also keep existing variables:
- `MONGODB_URI`
- `PORT`
- `NODE_ENV`
- `ANTHROPIC_API_KEY`
- `JWT_SECRET`
- `CORS_ORIGINS`

## Notes
- The old `POST /api/diagnose` route is now backed by the new AI symptom analysis workflow.
- `backend/.env.example` has been updated with `GEMINI_API_KEY`.
- Run `npm install` in `backend` after updating dependencies.
- Verified `npx tsc --noEmit` passes after integration.
