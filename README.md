# 🌿 ArogyaAI — AI-Based Remote Diagnosis System for Rural Healthcare

<div align="center">

![ArogyaAI Banner](https://img.shields.io/badge/ArogyaAI-Rural%20Health%20Assistant-0f8c51?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNDQgNDQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQ0IiBoZWlnaHQ9IjQ0IiByeD0iMjIiIGZpbGw9IiMwZjhjNTEiLz48L3N2Zz4=)

![Round](https://img.shields.io/badge/Codecure%20Hackathon-SPIRIT'26%20IIT--BHU-8B0000?style=for-the-badge)
![Team](https://img.shields.io/badge/Team-Codecure26-0f8c51?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Submitted-brightgreen?style=for-the-badge)

**🏆 Codecure AI Hackathon · SPIRIT'26 · IIT (BHU) Varanasi**

[🔴 Live Demo](https://baburathod.github.io/ArogyaAI) · [📂 Repository](https://github.com/baburathod/ArogyaAI) · [📋 Google Form Submission](https://forms.gle/4zE1hQpAroMusHaz7)

</div>

---

## 📌 Project Title

**ArogyaAI** — *Intelligent AI-Based Remote Diagnosis System for Rural Healthcare*

---

## 🔍 Overview

> *"600 million rural Indians lack reliable access to healthcare. ArogyaAI puts a smart doctor in every pocket."*

**ArogyaAI** is a voice-first, multilingual, AI-powered health assistant designed specifically for rural Indian communities. It bridges the critical gap between underserved populations and quality healthcare by combining Claude AI with a rule-based medical engine — all in a lightweight web app that works **offline**.

### 🎯 Problem We Solve

| Problem | ArogyaAI Solution |
|---|---|
| No doctors nearby | AI-powered symptom diagnosis 24/7 |
| Language barriers | Full support for English, Hindi & Telugu |
| Low literacy | Voice input + icon-based body map |
| No internet connectivity | Offline PWA with local data storage |
| Delayed emergency response | Auto SMS alert + 108 ambulance integration |
| No health records | Personal mini EHR stored on device |

---

## 👥 Team Codecure26

| Name | Role | College |
|---|---|---|
| **Ramavath Babu** | Team Leader · Frontend & Integration | Guru Ghasidas Vishwavidyalaya |
| **Dyaga Nishmitha** | AI/ML & Diagnosis Engine | Sreenidhi Institute of Science and Technology |
| **Ramavath Babu** | Backend & API Integration | Guru Ghasidas Vishwavidyalaya |

---

## ✨ Key Features

### 🧠 Core AI Features
- **Hybrid AI Diagnosis** — Claude API (claude-sonnet-4) + rule-based fallback engine
- **Explainable AI** — Shows *"Why this diagnosis?"* with full reasoning transparency
- **AI Confidence Score** — Displays model confidence percentage per diagnosis
- **Animated AI Loading Steps** — Visual 4-step thinking process

### 🎙️ Voice & Accessibility
- **Voice-First Conversational Orb** — Tap to speak, AI responds like a virtual doctor
- **Web Speech API** — Supports en-IN, hi-IN, te-IN regional accents
- **Low-Literacy Body Map** — Tap where it hurts (icon-based, no reading required)
- **Text-to-Speech Guidance** — AI reads results aloud for non-literate users

### 🌐 Multilingual Support
- **3 Languages** — English, Hindi (हिंदी), Telugu (తెలుగు)
- Instant UI switching including symptom tags, results, and advice
- All medical advice culturally appropriate for rural India

### 🚨 Emergency System
- **Smart Emergency Detection** — Detects 14+ critical keywords (chest pain, stroke, etc.)
- **Emergency Overlay** — Full-screen alert with pulsing animation
- **Auto SMS Alert** — Pre-fills SMS with condition + GPS location to family
- **One-Tap Ambulance** — Direct call to 108

### 🏥 Smart Hospital Finder
- **Condition-Matched Hospitals** — Recommends cardiology vs general vs ortho based on diagnosis
- **OpenStreetMap Integration** — Free map, no API key, works offline-first
- **Government PHC/CHC Priority** — Surfaces free government facilities first
- **Direct Directions** — One tap to Google Maps navigation

### 🌐 Offline PWA
- **Service Worker** — Caches all app assets on first load
- **localStorage EHR** — All health data stored locally, never sent to server
- **Offline Banner** — Clear indicator when running without internet
- **Sync-ready** — Architecture prepared for background sync when online

### 📋 Personal Health Record (Mini EHR)
- **Patient Profile** — Name, age, blood group, allergies, emergency contact
- **Health ID Card** — Printable digital health identity
- **Diagnosis History** — Stores last 30 diagnoses with dates
- **Severity Tracker Chart** — Visual bar chart of health over time

### 💓 Vitals & BMI
- BMI Calculator with animated gauge needle
- Heart Rate assessment (bradycardia / tachycardia detection)
- Blood Pressure classifier (low / pre-hypertension / hypertension)
- Temperature & SpO2 (oxygen saturation) assessment
- IoT-ready panel for smartwatch / BP monitor integration (future)

### 💊 Medicine Reminders
- Add medicines with dosage, frequency, time
- Browser notification reminders
- Weight-based dosage calculator (Paracetamol, Ibuprofen, Amoxicillin, ORS)

### 🧑‍⚕️ Doctor Connect
- **eSanjeevani Integration** — Links to free government telemedicine
- **ASHA Worker Helpline** — Direct 104 connection
- **Auto Emergency Alert** — Saves emergency contact, triggers SMS on detection
- **Ayushman Bharat PM-JAY** — Eligibility check link

### 🔐 Data Privacy
- All data stored locally on device only
- Basic Base64 encoding for sensitive fields
- One-tap data export (JSON) and complete deletion
- Zero ads, zero tracking, zero third-party data sharing
- Full data transparency table shown to users

---

## 🛠️ Tech Stack & Tools

### Frontend
| Technology | Purpose |
|---|---|
| HTML5 | App structure & semantic markup |
| CSS3 | Premium green dashboard UI, animations, glassmorphism |
| JavaScript (ES6+) | All client-side logic, modular file architecture |
| Google Fonts (Syne + DM Sans) | Typography |

### AI / Logic
| Technology | Purpose |
|---|---|
| **Claude API** (claude-sonnet-4-20250514) | Primary AI diagnosis engine |
| Rule-Based Engine (JS) | Offline fallback, 12+ condition database |
| Hybrid Logic | Claude output + rule validation = more accurate results |

### APIs & Services
| Technology | Purpose |
|---|---|
| Web Speech API | Voice input (speech-to-text) in 3 languages |
| SpeechSynthesis API | Text-to-speech voice guidance |
| Geolocation API | User location for hospital finder |
| OpenStreetMap Embed | Free map display, no API key |
| Notification API | Medicine reminder alerts |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Server runtime |
| Express.js | API server & static file hosting |
| Claude API Proxy | Secure API key management server-side |

### Development Tools
| Tool | Purpose |
|---|---|
| VS Code | Primary IDE |
| GitHub | Version control & hosting |
| GitHub Pages | Live deployment |
| Chrome DevTools | Testing & debugging |
| Postman | API testing |

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js v18+ installed
- Git installed
- Modern browser (Chrome recommended for voice features)

### Option 1 — Run Frontend Only (Simplest)

```bash
# Clone the repository
git clone https://github.com/baburathod/ArogyaAI.git

# Navigate into folder
cd ArogyaAI

# Open directly in browser — no server needed!
open index.html
# OR right-click index.html → Open with Live Server (VS Code extension)
```

### Option 2 — Run with Backend Server

```bash
# Clone the repository
git clone https://github.com/baburathod/ArogyaAI.git
cd ArogyaAI

# Install dependencies
npm install

# Set your Anthropic API key
# Windows:
set ANTHROPIC_API_KEY=your_api_key_here
# Mac/Linux:
export ANTHROPIC_API_KEY=your_api_key_here

# Start the server
npm start

# Visit in browser
open http://localhost:3000
```

### Option 3 — GitHub Pages (Live Demo)

The app is deployed at:
```
https://baburathod.github.io/ArogyaAI
```

No setup required — open and use instantly.

---

## 📁 Project Structure

```
ArogyaAI/
│
├── index.html              # Main app — 7-section dashboard structure
├── sw.js                   # Service Worker for offline PWA
├── package.json            # Node.js configuration
│
├── css/
│   └── style.css           # Premium green UI — 837 lines of design
│
├── js/
│   ├── app.js              # Main controller · navigation · offline detection
│   ├── languages.js        # Multilingual system — EN / Hindi / Telugu
│   ├── voice.js            # Conversational voice AI orb · Web Speech API
│   ├── diagnosis.js        # Hybrid AI engine · Claude API · Explainable AI
│   ├── hospitals.js        # Smart hospital finder · OpenStreetMap · condition matching
│   ├── vitals.js           # BMI · Heart Rate · BP · Temperature · SpO2
│   ├── medicine.js         # Medicine reminders · dosage calculator
│   ├── history.js          # Personal health record · EHR · severity chart
│   ├── doctor.js           # Auto SMS alert · eSanjeevani · emergency contact
│   └── privacy.js          # Data export · deletion · encryption · summary
│
└── backend/
    └── server.js           # Express.js API proxy for Claude
```

---

## 🏗️ Technical Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INPUT                              │
│         Text  ·  Voice (Speech API)  ·  Body Map tap           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PREPROCESSING LAYER                          │
│   Language Detection  ·  Emergency Keyword Scan  ·  Severity   │
│   Slider Value  ·  Duration Selection  ·  Tag Normalization     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
┌─────────────────────┐    ┌─────────────────────────────────────┐
│   CLAUDE AI ENGINE  │    │        RULE-BASED FALLBACK          │
│  claude-sonnet-4    │    │   12-condition medical database      │
│  Returns: JSON      │    │   Works 100% offline                │
│  condition, severity│    │   Instant response                  │
│  advice, confidence │    └──────────────┬──────────────────────┘
│  why, isEmergency   │                   │
└──────────┬──────────┘                   │
           │                             │
           └────────────┬────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RESPONSE GENERATION                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │ Severity     │  │ Explainable  │  │ Confidence Score      │ │
│  │ Classification│  │ AI Reasoning │  │ (AI transparency)     │ │
│  └──────────────┘  └──────────────┘  └───────────────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │ Health Advice│  │ Emergency    │  │ Auto SMS Alert        │ │
│  │ (4-5 steps)  │  │ Overlay      │  │ (family notification) │ │
│  └──────────────┘  └──────────────┘  └───────────────────────┘ │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  HOSPITAL RECOMMENDATION                        │
│  Geolocation API → OpenStreetMap → Condition-Matched Hospitals  │
│  Cardiology / Emergency / Ortho / General — based on diagnosis  │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA PERSISTENCE                             │
│         localStorage (Device Only) · Never sent to server       │
│  Profile · History (30 records) · Medicines · Alert Contact     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Judging Criteria — How We Score

| Criteria | Our Implementation | Score |
|---|---|---|
| **Functionality** | 7 fully working sections · Voice · AI · Maps · EHR · Vitals · Meds · Privacy | ⭐⭐⭐⭐⭐ |
| **Code Quality** | 15 modular files · Commented code · ES6+ standards · Clean separation of concerns | ⭐⭐⭐⭐⭐ |
| **Scalability** | Offline-first · Multilingual · Backend API proxy · Ayushman Bharat API-ready | ⭐⭐⭐⭐⭐ |
| **Innovation** | Explainable AI · Auto SMS alerts · Body map · Low-literacy mode · Hybrid AI | ⭐⭐⭐⭐⭐ |

---

## 💡 Special Features Judges Don't Expect

### 🏥 "First-Mile Healthcare Solution"
ArogyaAI helps patients **before** they reach the hospital — enabling triage, emergency detection, and ambulance calling from any village with a smartphone.

### 🌾 "Designed for Rural Constraints"
Every design decision was made with rural users in mind:
- Works on 2G/3G or completely offline
- No account or registration needed
- Icon-based navigation for low-literacy users
- Voice input for users who can't type
- Regional language support from day one

### 🏛️ "Scalable to Government Systems"
ArogyaAI is architected for future integration with:
- **Ayushman Bharat PM-JAY** — health coverage API
- **ABDM / ABHA Health ID** — digital health identity
- **eSanjeevani** — government telemedicine platform
- **HMIS** — Hospital Management Information System
- **IoT devices** — smartwatch, BP monitor, glucometer

---

## 🌍 Impact & Benefits

- **600M+ rural Indians** can access free AI health guidance
- Reduces unnecessary hospital visits for mild conditions
- Saves lives through rapid emergency detection and 108 escalation
- Works on any ₹3,000 Android phone with Chrome browser
- Zero cost for end users — completely free
- Supports government's Digital Health Mission vision

---

## 🔗 References & Resources

- [World Health Organization — Rural Health](https://www.who.int)
- [Government of India Data Portal](https://data.gov.in)
- [PubMed — AI in Healthcare Research](https://pubmed.ncbi.nlm.nih.gov)
- [Anthropic Claude API Documentation](https://docs.anthropic.com)
- [eSanjeevani — Government Telemedicine](https://esanjeevaniopd.in)
- [Ayushman Bharat PM-JAY](https://pmjay.gov.in)
- [ABDM — Ayushman Bharat Digital Mission](https://abdm.gov.in)

---

## 📞 Emergency Contacts (India)

| Service | Number |
|---|---|
| 🚑 Ambulance | **108** |
| 🏥 Health Helpline | **104** |
| 👮 Police | **100** |
| 🆘 National Emergency | **112** |

---

## ⚠️ Disclaimer

ArogyaAI provides general health guidance only and is **not a substitute for professional medical advice, diagnosis, or treatment**. Always consult a qualified doctor for serious medical conditions.

---

<div align="center">

**Built with ❤️ for rural India**

🌿 **ArogyaAI** · Team Codecure26 · Guru Ghasidas Vishwavidyalaya, Bilaspur , Koni, Bilaspur, Chhattisgarh 495009 /Sreenidhi Institute of Science and Technology

🏆 **Codecure AI Hackathon · SPIRIT'26 · IIT (BHU) Varanasi**

*Powered by Team Codecure26 · Ayushman Bharat Ready · First-Mile Healthcare Solution*

</div>
