# 🌿 ArogyaAI — AI-Based Remote Diagnosis System for Rural Healthcare

<div align="center">

![ArogyaAI Banner](https://img.shields.io/badge/ArogyaAI-Rural%20Health%20Assistant-0f8c51?style=for-the-badge)
![Round](https://img.shields.io/badge/Codecure%20Hackathon-SPIRIT'26%20IIT--BHU-8B0000?style=for-the-badge)
![Team](https://img.shields.io/badge/Team-Codecure26-0f8c51?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Submitted-brightgreen?style=for-the-badge)

**🏆 Codecure AI Hackathon · SPIRIT'26 · IIT (BHU) Varanasi**

[🔴 Live Demo](https://baburathod.github.io/ArogyaAI) · [📂 Repository](https://github.com/baburathod/ArogyaAI)

</div>

---

## 📌 Project Title

**ArogyaAI** — *AI-Based Remote Diagnosis System for Rural Healthcare*

---

## 🔍 Overview

> *"600 million rural Indians lack reliable access to healthcare. ArogyaAI puts a smart doctor in every pocket."*

**ArogyaAI** is a voice-first, multilingual, AI-powered health assistant designed for rural Indian communities. It bridges the critical healthcare gap by combining Claude AI with a rule-based medical engine — in a lightweight web app that works **offline**.

### 🎯 Problem We Solve

| Problem | ArogyaAI Solution |
|---|---|
| No doctors nearby | AI-powered symptom diagnosis 24/7 |
| Language barriers | Full support for English, Hindi & Telugu |
| Low literacy | Voice input + icon-based body map |
| No internet | Offline PWA with local data storage |
| Delayed emergency response | Auto SMS alert + 108 ambulance integration |
| No health records | Personal mini EHR stored on device |

---

## 👥 Team Codecure26

| Name | Role | College |
|---|---|---|
| **Ramavath Babu** | Team Leader · Backend & API Integration | Guru Ghasidas Vishwavidyalaya, Bilaspur , Koni, Bilaspur, Chhattisgarh 495009 |
| **Dyaga Nishmitha** | AI/ML & Diagnosis Engine | Sreenidhi Institute of Science and Technology |

---

## ✨ Key Features

### 🧠 AI Features
- **Hybrid AI Diagnosis** — Claude API + rule-based fallback engine
- **Explainable AI** — Shows *"Why this diagnosis?"* with full transparency
- **AI Confidence Score** — Percentage confidence per diagnosis
- **Animated Loading Steps** — 4-step visual AI thinking process

### 🎙️ Voice & Accessibility
- **Voice-First Conversational Orb** — Speak symptoms, AI responds like a doctor
- **Web Speech API** — Supports en-IN, hi-IN, te-IN regional accents
- **Low-Literacy Body Map** — Tap where it hurts, no typing needed
- **Text-to-Speech** — AI reads results aloud

### 🌐 Multilingual Support
- **3 Languages** — English, Hindi (हिंदी), Telugu (తెలుగు)
- Instant UI switching with culturally appropriate medical advice

### 🚨 Emergency System
- **Smart Emergency Detection** — 14+ critical keywords detected instantly
- **Emergency Overlay** — Full-screen pulsing alert
- **Auto SMS Alert** — GPS location sent to family contact
- **One-Tap Ambulance** — Direct call to 108

### 🏥 Smart Hospital Finder
- **Condition-Matched** — Cardiology vs general vs ortho based on diagnosis
- **OpenStreetMap** — Free map, no API key required
- **Government PHC/CHC Priority** — Free facilities shown first

### 🌐 Offline PWA
- **Service Worker** — Caches all app assets on first load
- **localStorage EHR** — All data stored locally, never sent to server

### 📋 Personal Health Record
- Patient profile, Health ID card, 30-diagnosis history
- Severity tracker chart over time

### 💓 Vitals & BMI
- BMI Calculator, Heart Rate, Blood Pressure, Temperature, SpO2

### 💊 Medicine Reminders
- Add medicines with dosage, frequency, time
- Weight-based dosage calculator

### 🧑‍⚕️ Doctor Connect
- eSanjeevani government telemedicine integration
- ASHA Worker helpline · Ayushman Bharat PM-JAY link

### 🔐 Data Privacy
- All data stored locally on device only
- One-tap data export and deletion
- Zero ads, zero tracking, zero third-party sharing

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **Fonts** | Google Fonts — Syne + DM Sans |
| **AI Engine** | Claude API (claude-sonnet-4) + Rule-Based JS fallback |
| **Voice** | Web Speech API + SpeechSynthesis API |
| **Maps** | OpenStreetMap Embed (free, no API key) |
| **Location** | Geolocation API |
| **Backend** | Node.js + Express.js |
| **Storage** | localStorage (device only) |
| **Offline** | Service Worker (PWA) |
| **Tools** | VS Code, GitHub, GitHub Pages, Chrome DevTools |

---

## ⚙️ Installation & Setup

### Option 1 — Open Directly (No Setup)
```bash
git clone https://github.com/baburathod/ArogyaAI.git
cd ArogyaAI
# Open index.html in Chrome
# OR: right-click → Open with Live Server (VS Code)
```

### Option 2 — Run with Backend
```bash
git clone https://github.com/baburathod/ArogyaAI.git
cd ArogyaAI
npm install
# Windows:
set ANTHROPIC_API_KEY=your_api_key_here
npm start
# Visit: http://localhost:3000
```

### Option 3 — Live Demo
```
https://baburathod.github.io/ArogyaAI
```

---

## 📁 Project Structure

```
ArogyaAI/
├── index.html              # Main app — 7-section dashboard
├── sw.js                   # Service Worker — offline PWA
├── package.json            # Node.js config
├── css/
│   └── style.css           # Premium green UI
├── js/
│   ├── app.js              # Main controller · navigation · offline
│   ├── languages.js        # EN / Hindi / Telugu multilingual
│   ├── voice.js            # Voice AI orb · Web Speech API
│   ├── diagnosis.js        # Hybrid AI · Claude API · Explainable AI
│   ├── hospitals.js        # Smart hospital finder · OpenStreetMap
│   ├── vitals.js           # BMI · HR · BP · Temperature · SpO2
│   ├── medicine.js         # Medicine reminders · dosage calculator
│   ├── history.js          # Health record · EHR · severity chart
│   ├── doctor.js           # SMS alert · eSanjeevani · emergency
│   └── privacy.js          # Data export · deletion · encryption
└── backend/
    └── server.js           # Express.js · Claude API proxy
```

---

## 🏗️ Technical Workflow

```
User Input (Text / Voice / Body Map)
        ↓
Preprocessing (Language · Emergency Scan · Severity)
        ↓
   ┌────────────────────┐
   ↓                    ↓
Claude AI API      Rule-Based Fallback
(Primary)          (Works Offline)
   └────────┬───────────┘
            ↓
Response Generation
(Severity · Explainable AI · Confidence · Advice · Emergency Alert)
            ↓
Hospital Recommendation
(OpenStreetMap · Condition-Matched · Govt PHC Priority)
            ↓
Data Persistence
(localStorage · Device Only · Never Sent to Server)
```

---

## 📊 Judging Criteria

| Criteria | Our Implementation |
|---|---|
| **Functionality** | 7 working sections · Voice · AI · Maps · EHR · Vitals · Meds · Privacy |
| **Code Quality** | 15 modular files · Commented · ES6+ · Clean architecture |
| **Scalability** | Offline-first · Multilingual · Ayushman Bharat API-ready |
| **Innovation** | Explainable AI · Auto SMS · Body map · Low-literacy mode |

---

## 🌍 Impact

- **600M+ rural Indians** can access free AI health guidance
- Works on any ₹3,000 Android phone with Chrome
- Zero cost for end users
- Emergency detection can save lives
- Ready for Ayushman Bharat, ABDM, eSanjeevani integration

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

ArogyaAI provides general health guidance only and is **not a substitute for professional medical advice**. Always consult a qualified doctor for serious conditions.

---

<div align="center">

**Built with ❤️ for rural India**

🌿 **ArogyaAI** · Team Codecure26 · Guru Ghasidas Vishwavidyalaya, Bilaspur , Koni, Bilaspur, Chhattisgarh 495009 / Sreenidhi Institute of Science and Technology

🏆 **Codecure AI Hackathon · SPIRIT'26 · IIT (BHU) Varanasi**

*Powered by Team Codecure26 · Ayushman Bharat Ready · First-Mile Healthcare Solution*

</div>