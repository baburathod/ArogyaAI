/* ============================================================
   languages.js — Multilingual Support (EN / HI / TE)
   Team Codecure26 | ArogyaAI | SPIRIT'26
   ============================================================ */

let currentLang = 'en';

const translations = {
  en: {
    'hero-title':      'Your Health,<br/><span class="hero-accent">Our Responsibility</span>',
    'hero-sub':        'AI-powered rural health assistant. Voice-first. Works offline. Saves lives.',
    'sym-title':       'Describe Your Symptoms',
    'quick-label':     'Quick Select:',
    'analyze-label':   'Analyze with AI',
    'hosp-title':      'Smart Hospital Finder',
    'locate-label':    'Find Best Hospital For Me',
    'tips-title':      'Health Awareness Engine',
    'result-title':    'AI Diagnosis & Advice',
    'loading-text':    'AI is analyzing your symptoms...',
    'disclaimer-text': 'General guidance only — <strong>not a substitute for professional medical advice</strong>. Always consult a doctor.',
    tags:      ['🌡️ Fever','🤕 Headache','😷 Cough','🤢 Stomach Pain','💔 Chest Pain','🤮 Vomiting','😵 Dizziness','😣 Body Ache','😮‍💨 Breathlessness','🏥 Diarrhea','🦴 Back Pain','🗣️ Sore Throat'],
    tagValues: ['fever','headache','cough','stomach pain','chest pain','vomiting','dizziness','body ache','shortness of breath','diarrhea','back pain','sore throat'],
    placeholder: 'e.g. fever, headache, body ache...'
  },
  hi: {
    'hero-title':      'आपका स्वास्थ्य,<br/><span class="hero-accent">हमारी जिम्मेदारी</span>',
    'hero-sub':        'AI-संचालित ग्रामीण स्वास्थ्य सहायक। वॉयस-फर्स्ट। ऑफलाइन काम करता है।',
    'sym-title':       'अपने लक्षण बताएं',
    'quick-label':     'जल्दी चुनें:',
    'analyze-label':   'AI से विश्लेषण करें',
    'hosp-title':      'स्मार्ट अस्पताल खोजक',
    'locate-label':    'मेरे लिए सबसे अच्छा अस्पताल खोजें',
    'tips-title':      'स्वास्थ्य जागरूकता इंजन',
    'result-title':    'AI निदान और सलाह',
    'loading-text':    'AI आपके लक्षणों का विश्लेषण कर रहा है...',
    'disclaimer-text': 'केवल सामान्य मार्गदर्शन — <strong>डॉक्टर की सलाह का विकल्प नहीं</strong>।',
    tags:      ['🌡️ बुखार','🤕 सिरदर्द','😷 खांसी','🤢 पेट दर्द','💔 छाती दर्द','🤮 उल्टी','😵 चक्कर','😣 बदन दर्द','😮‍💨 सांस की तकलीफ','🏥 दस्त','🦴 कमर दर्द','🗣️ गले में दर्द'],
    tagValues: ['fever','headache','cough','stomach pain','chest pain','vomiting','dizziness','body ache','shortness of breath','diarrhea','back pain','sore throat'],
    placeholder: 'जैसे बुखार, सिरदर्द, बदन दर्द...'
  },
  te: {
    'hero-title':      'మీ ఆరోగ్యం,<br/><span class="hero-accent">మా బాధ్యత</span>',
    'hero-sub':        'AI ఆధారిత గ్రామీణ ఆరోగ్య సహాయకుడు. వాయిస్-ఫస్ట్. ఆఫ్‌లైన్‌లో పని చేస్తుంది.',
    'sym-title':       'మీ లక్షణాలు వివరించండి',
    'quick-label':     'త్వరగా ఎంచుకోండి:',
    'analyze-label':   'AI తో విశ్లేషించు',
    'hosp-title':      'స్మార్ట్ ఆసుపత్రి శోధకుడు',
    'locate-label':    'నాకు అత్యుత్తమ ఆసుపత్రిని కనుగొనండి',
    'tips-title':      'ఆరోగ్య అవగాహన ఇంజిన్',
    'result-title':    'AI రోగ నిర్ధారణ & సలహా',
    'loading-text':    'AI మీ లక్షణాలను విశ్లేషిస్తోంది...',
    'disclaimer-text': 'సాధారణ మార్గదర్శనం మాత్రమే — <strong>వైద్యుని సలహాకు ప్రత్యామ్నాయం కాదు</strong>.',
    tags:      ['🌡️ జ్వరం','🤕 తలనొప్పి','😷 దగ్గు','🤢 కడుపు నొప్పి','💔 ఛాతీ నొప్పి','🤮 వాంతులు','😵 తలతిరగడం','😣 ఒళ్ళు నొప్పి','😮‍💨 శ్వాస కష్టం','🏥 విరేచనాలు','🦴 నడుము నొప్పి','🗣️ గొంతు నొప్పి'],
    tagValues: ['fever','headache','cough','stomach pain','chest pain','vomiting','dizziness','body ache','shortness of breath','diarrhea','back pain','sore throat'],
    placeholder: 'ఉదా: జ్వరం, తలనొప్పి, ఒళ్ళు నొప్పి...'
  }
};

function setLang(lang) {
  currentLang = lang;
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.textContent.trim() === {en:'EN',hi:'हिं',te:'తె'}[lang]);
  });
  const t = translations[lang];
  ['hero-title','hero-sub','sym-title','quick-label','analyze-label','hosp-title','locate-label','tips-title','result-title','loading-text','disclaimer-text'].forEach(k => {
    const el = document.getElementById(k); if(el) el.innerHTML = t[k] || '';
  });
  document.getElementById('symptomInput').placeholder = t.placeholder;
  rebuildTags(lang);
  buildTips(lang);
}

function rebuildTags(lang) {
  const t = translations[lang];
  const container = document.getElementById('symptomTags');
  if (!container) return;
  container.innerHTML = '';
  t.tags.forEach((label, i) => {
    const val = t.tagValues[i];
    const span = document.createElement('span');
    span.className = 'sym-tag' + (selectedTags.includes(val) ? ' selected' : '');
    span.textContent = label;
    span.onclick = function() { toggleTag(this, val); };
    container.appendChild(span);
  });
}