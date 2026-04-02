/* ============================================================
   diagnosis.js — Hybrid AI Engine
   Claude API + Rule-Based Fallback + Explainable AI
   Team Codecure26 | ArogyaAI | SPIRIT'26
   ============================================================ */

const EMERGENCY_KEYWORDS = [
  'chest pain','heart attack','stroke','unconscious','not breathing',
  'severe bleeding','seizure','shortness of breath','difficulty breathing',
  'collapse','fainted','convulsion','paralysis','poison','overdose'
];

const severityLabels = {
  low:    { en:'🟢 Mild Condition',                hi:'🟢 हल्की स्थिति',      te:'🟢 తేలికపాటి స్థితి',          class:'severity-low'    },
  medium: { en:'🟡 Moderate – Monitor Closely',    hi:'🟡 मध्यम – ध्यान रखें', te:'🟡 మధ్యస్థం – జాగ్రత్తగా ఉండండి', class:'severity-medium' },
  high:   { en:'🔴 Serious – Seek Immediate Care', hi:'🔴 गंभीर – तुरंत चिकित्सा लें', te:'🔴 తీవ్రమైనది – వెంటనే వైద్యం తీసుకోండి', class:'severity-high' }
};

const diagnosisDB = {
  'chest pain':           { title:'⚠️ Possible Cardiac Event', severity:'high',   hospitalType:'cardiology',  desc:'Chest pain may indicate a serious cardiac condition requiring immediate attention.',  why:'Chest pain combined with your reported symptoms matches cardiac emergency patterns. The symptom profile shows high-risk indicators.', advice:[{icon:'🚨',text:'Call 108 immediately — do not drive yourself'},{icon:'🛑',text:'Stop all activity, sit or lie down'},{icon:'💊',text:'Chew one aspirin if available and not allergic'},{icon:'🧍',text:'Sit upright — do not lie flat'},{icon:'📞',text:'Have someone stay with you at all times'}] },
  'shortness of breath':  { title:'⚠️ Acute Respiratory Distress', severity:'high', hospitalType:'emergency',  desc:'Difficulty breathing requires urgent evaluation — could indicate asthma, cardiac or pulmonary issues.', why:'Shortness of breath indicates potential airway or cardiovascular compromise. Your severity rating suggests this needs immediate attention.', advice:[{icon:'🚨',text:'Seek emergency care immediately if severe'},{icon:'🧘',text:'Sit upright, breathe slowly and deeply'},{icon:'💨',text:'Use your inhaler if prescribed (asthma)'},{icon:'🏥',text:'Go to nearest emergency room now'}] },
  'fever':                { title:'Viral Fever / Infection', severity:'medium', hospitalType:'general',  desc:'Symptoms suggest viral fever, possibly flu or infection. Most resolve in 3–7 days with proper care.', why:'The combination of fever with your reported duration and severity score ('+document.getElementById?.('severitySlider')?.value+'/10) indicates a likely viral origin. Rule-based matching identified fever pattern.', advice:[{icon:'💧',text:'Drink plenty of fluids — water, coconut water, ORS'},{icon:'🛏️',text:'Rest and avoid physical exertion'},{icon:'💊',text:'Paracetamol (500mg) for temperature above 38.5°C'},{icon:'🌡️',text:'Monitor temperature every 4 hours'},{icon:'🏥',text:'See doctor if fever persists 3+ days or exceeds 103°F'}] },
  'headache':             { title:'Tension Headache / Migraine', severity:'low',   hospitalType:'general', desc:'Consistent with tension headache or migraine. Manageable with rest and OTC medication.', why:'Headache presentation without neurological red flags suggests tension-type or migraine origin based on our diagnostic rules.', advice:[{icon:'💊',text:'Take paracetamol or ibuprofen as directed'},{icon:'😴',text:'Rest in a dark, quiet room'},{icon:'💧',text:'Hydrate — dehydration is a common trigger'},{icon:'🧊',text:'Cold or warm compress on head/neck'},{icon:'🏥',text:'See doctor if severe, sudden, or with fever/stiff neck'}] },
  'cough':                { title:'Respiratory Tract Infection', severity:'low',   hospitalType:'general', desc:'Usually caused by viral infections or irritants. Most cases resolve in 1–2 weeks.', why:'Cough pattern matches upper respiratory infection. No high-severity red flags detected in symptom analysis.', advice:[{icon:'🍯',text:'Honey with warm water or ginger tea soothes cough'},{icon:'💧',text:'Stay well hydrated'},{icon:'😷',text:'Cover mouth when coughing to prevent spread'},{icon:'💊',text:'OTC cough syrups may relieve symptoms'},{icon:'🏥',text:'Doctor if cough lasts 2+ weeks or has blood'}] },
  'stomach pain':         { title:'Gastrointestinal Disturbance', severity:'medium', hospitalType:'general', desc:'Could be indigestion, gas, food poisoning or gastritis. Monitor for worsening.', why:'Abdominal pain without fever or rigidity suggests non-surgical GI issue based on rule-based triage logic.', advice:[{icon:'🍵',text:'Drink warm water or herbal tea'},{icon:'🥣',text:'Light foods: rice, khichdi, banana'},{icon:'🚫',text:'Avoid spicy, oily foods'},{icon:'💊',text:'Antacid may help for acidity pain'},{icon:'🏥',text:'Seek care if pain is severe, persistent, or with fever'}] },
  'vomiting':             { title:'Nausea / Acute Gastroenteritis', severity:'medium', hospitalType:'general', desc:'Often caused by food poisoning or infections. Preventing dehydration is the priority.', why:'Vomiting pattern consistent with acute gastroenteritis. Dehydration risk flagged based on symptom duration.', advice:[{icon:'💧',text:'ORS (Oral Rehydration Solution) — take frequently'},{icon:'🥣',text:'Small amounts of bland food when able'},{icon:'🚫',text:'No solid food for 1–2 hours post-vomiting'},{icon:'💊',text:'Domperidone or OTC anti-emetics can help'},{icon:'🏥',text:'Doctor if vomiting persists or has blood'}] },
  'dizziness':            { title:'Vertigo / Hypotension',         severity:'medium', hospitalType:'general', desc:'May be due to low BP, dehydration, anemia or inner ear issues. Rest immediately.', why:'Dizziness assessment suggests orthostatic hypotension or dehydration as likely cause based on symptom pattern.', advice:[{icon:'🛋️',text:'Sit or lie down to avoid falling'},{icon:'💧',text:'Drink ORS or water immediately'},{icon:'🧂',text:'Salty snack if you have low BP'},{icon:'🚶',text:'Rise slowly from sitting/lying positions'},{icon:'🏥',text:'Doctor if frequent or with fainting'}] },
  'body ache':            { title:'Viral Myalgia / Fatigue',       severity:'low',   hospitalType:'general', desc:'Body aches commonly accompany viral infections or overexertion. Rest is essential.', why:'Generalised myalgia without localised pain points to systemic viral infection based on diagnostic rules.', advice:[{icon:'🛏️',text:'Rest — avoid heavy physical work'},{icon:'💊',text:'Paracetamol relieves body aches'},{icon:'🛁',text:'Warm bath or hot water bottle helps'},{icon:'💧',text:'Stay hydrated and eat nutritiously'},{icon:'🏥',text:'Doctor if severe or with high fever'}] },
  'diarrhea':             { title:'Acute Diarrhea / Food Infection', severity:'medium', hospitalType:'general', desc:'Caused by food/water contamination or viral infection. Dehydration prevention is critical.', why:'Acute onset diarrhea matches food-borne or viral gastroenteritis pattern. Dehydration risk increases with duration.', advice:[{icon:'💧',text:'ORS frequently — every 15 minutes'},{icon:'🍌',text:'BRAT diet: Bananas, Rice, Applesauce, Toast'},{icon:'🚫',text:'Avoid dairy, spicy, oily foods'},{icon:'🧼',text:'Strict handwashing and hygiene'},{icon:'🏥',text:'Doctor if 2+ days or has blood'}] },
  'back pain':            { title:'Musculoskeletal Back Pain',      severity:'low',   hospitalType:'ortho',   desc:'Most back pain is muscular in origin and resolves with rest and mild pain relief.', why:'Localised back pain without neurological symptoms suggests musculoskeletal origin.', advice:[{icon:'🛏️',text:'Rest — avoid heavy lifting'},{icon:'🧊',text:'Ice pack first 24 hrs, then warm compress'},{icon:'💊',text:'Ibuprofen or paracetamol for pain'},{icon:'🧘',text:'Gentle stretching after 48 hours'},{icon:'🏥',text:'Doctor if pain radiates to legs or with numbness'}] },
  'sore throat':          { title:'Pharyngitis / Tonsillitis',      severity:'low',   hospitalType:'general', desc:'Throat infection is usually viral and resolves in 5–10 days with supportive care.', why:'Throat pain pattern matches viral pharyngitis. No high-severity systemic features detected.', advice:[{icon:'🧂',text:'Gargle warm salt water 3x daily'},{icon:'🍯',text:'Honey and ginger in warm water'},{icon:'💊',text:'Throat lozenges or OTC pain relievers'},{icon:'💧',text:'Stay well hydrated'},{icon:'🏥',text:'Doctor if difficulty swallowing or 5+ days'}] }
};

const DIAGNOSIS_PRIORITY = ['chest pain','shortness of breath','fever','headache','cough','stomach pain','vomiting','dizziness','body ache','diarrhea','back pain','sore throat'];
const FALLBACK = { title:'General Health Concern', severity:'low', hospitalType:'general', why:'No specific condition pattern was matched. General wellness rules applied.', desc:'We recommend monitoring your condition and following basic wellness practices.', advice:[{icon:'💧',text:'Stay hydrated and rest well'},{icon:'🥗',text:'Eat nutritious food'},{icon:'🌡️',text:'Monitor your vitals'},{icon:'🏥',text:'Visit a health centre if symptoms worsen'}] };

// ── Main Entry ────────────────────────────────────────────────
async function analyzeSymptoms() {
  const input = document.getElementById('symptomInput').value.trim().toLowerCase();
  if (!input) { alert('Please describe or select your symptoms first.'); return; }

  // UI: start loading
  document.getElementById('loading').classList.add('show');
  document.getElementById('resultPanel').classList.remove('show');
  document.getElementById('emergencyOverlay').classList.remove('show');
  document.getElementById('analyzeBtn').disabled = true;
  animateLoadingSteps();

  const isEmergency = EMERGENCY_KEYWORDS.some(k => input.includes(k));
  let matched = FALLBACK;
  for (const key of DIAGNOSIS_PRIORITY) {
    if (input.includes(key)) { matched = { ...diagnosisDB[key] }; break; }
  }

  matched = await getAIDiagnosis(input, matched);

  setTimeout(() => {
    document.getElementById('loading').classList.remove('show');
    document.getElementById('analyzeBtn').disabled = false;
    showResult(matched, isEmergency || matched.severity === 'high');
    speak('Diagnosis ready. ' + matched.title);
    // Cache result for offline
    localStorage.setItem('lastDiagnosis', JSON.stringify({ ...matched, timestamp: Date.now() }));
  }, 2400);
}

// ── Loading Animation ─────────────────────────────────────────
function animateLoadingSteps() {
  const steps = ['ls1','ls2','ls3','ls4'];
  steps.forEach(id => { const el = document.getElementById(id); if(el){el.classList.remove('active','done');} });
  steps.forEach((id, i) => {
    setTimeout(() => {
      const prev = steps[i-1];
      if (prev) { const p = document.getElementById(prev); if(p){p.classList.remove('active');p.classList.add('done');} }
      const el = document.getElementById(id); if(el) el.classList.add('active');
    }, i * 550);
  });
}

// ── Claude API ────────────────────────────────────────────────
async function getAIDiagnosis(input, fallback) {
  const slider = document.getElementById('severitySlider')?.value || '5';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content:
          `You are an expert rural health AI for India. Patient reports: "${input}". Severity: ${slider}/10. Duration: ${currentDuration}.
Return ONLY valid JSON, no markdown:
{"condition":"short name","severity":"low|medium|high","description":"2 sentence explanation","why":"1 sentence explaining why this diagnosis","advice":["tip1","tip2","tip3","tip4"],"isEmergency":true|false,"confidence":85}
Be concise, culturally appropriate for rural India. Pure JSON only.` }]
      })
    });
    const data = await res.json();
    const clean = (data.content?.[0]?.text || '').replace(/```json|```/g,'').trim();
    const ai = JSON.parse(clean);
    return {
      title:       ai.condition    || fallback.title,
      severity:    ai.severity     || fallback.severity,
      desc:        ai.description  || fallback.desc,
      why:         ai.why          || fallback.why,
      advice:      (ai.advice||[]).map(t => ({ icon:'✅', text:t })),
      confidence:  ai.confidence   || 78,
      isEmergency: !!ai.isEmergency,
      hospitalType: fallback.hospitalType || 'general'
    };
  } catch(e) {
    console.warn('Claude API fallback:', e.message);
    return { ...fallback, confidence: 70 };
  }
}

// ── Render Result ─────────────────────────────────────────────
function showResult(data, emergency) {
  const sev   = severityLabels[data.severity] || severityLabels.low;
  const badge = document.getElementById('severityBadge');
  badge.textContent = sev[currentLang] || sev.en;
  badge.className   = 'severity-badge ' + sev.class;

  const conf = document.getElementById('confidenceBadge');
  if (conf) conf.textContent = `🧬 AI Confidence: ${data.confidence || 78}%`;

  document.getElementById('diagnosisTitle').textContent = data.title;
  document.getElementById('diagnosisDesc').textContent  = data.desc;
  document.getElementById('result-timestamp').textContent = '🕐 ' + new Date().toLocaleTimeString('en-IN');

  // Explainable AI
  const explainBody = document.getElementById('explainBody');
  if (explainBody) {
    explainBody.innerHTML = `
      <p>📊 <strong>Symptom Match:</strong> ${document.getElementById('symptomInput').value}</p>
      <p style="margin-top:6px;">🔍 <strong>Reasoning:</strong> ${data.why || 'Pattern matched against medical knowledge base.'}</p>
      <p style="margin-top:6px;">⏱️ <strong>Duration Factor:</strong> ${currentDuration} — affects severity assessment</p>
      <p style="margin-top:6px;">🔢 <strong>Severity Score:</strong> ${document.getElementById('severitySlider')?.value || 5}/10 reported by patient</p>`;
  }

  const adviceList = document.getElementById('adviceList');
  adviceList.innerHTML = data.advice.map(item =>
    `<li><span class="advice-icon">${item.icon}</span><span>${item.text}</span></li>`
  ).join('');

  document.getElementById('resultPanel').classList.add('show');
  document.getElementById('resultPanel').scrollIntoView({ behavior:'smooth', block:'start' });

  // Store hospital type for smart matching
  window.lastHospitalType = data.hospitalType || 'general';

  if (emergency || data.isEmergency) {
    setTimeout(() => document.getElementById('emergencyOverlay').classList.add('show'), 300);
    // Auto-trigger SMS alert to emergency contact
    if (typeof triggerEmergencyAlert === 'function') {
      triggerEmergencyAlert(data.title);
    }
  }
}

function callEmergency() { window.location.href = 'tel:108'; }