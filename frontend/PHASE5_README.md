# ArogyaAI Phase 5 — Multilingual Voice Assistant

This phase adds an accessible, voice-powered healthcare assistant using the browser Web Speech API.

## New Features
- Speech-to-text using browser speech recognition
- Multilingual voice interaction in English, Hindi, and Telugu
- AI voice assistant response playback using speech synthesis
- Healthcare voice workflows for asking questions and hearing guidance
- Accessibility-friendly controls and keyboard support

## Frontend changes
- Added `components/VoiceAssistant.tsx`
- Updated `components/AIWorkflow.tsx` to include voice assistant support and Phase 5 messaging
- Voice assistant sits alongside the existing AI assistant chat flow on `/ai`

## Notes
- Voice recognition support depends on browser compatibility (Chrome / Edge / Safari may vary)
- The AI response is still powered by `/api/ai/assistant`
- Responses are spoken back using the selected language locale
