/* ============================================================
   app.js — Main Controller
   Navigation, initialization, offline mode, shared state
   Team Codecure26 | ArogyaAI | SPIRIT'26
   ============================================================ */

// ── Shared State ─────────────────────────────────────────────
let selectedTags  = [];
let currentDuration = 'Today';
let isLowLiteracy = false;

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  rebuildTags('en');
  buildTips('en');
  loadProfile();
  loadHistory();
  loadMedicines();
  detectOffline();
  initSeveritySlider();
  showSection('home');
  console.log('%cArogyaAI v2.0 initialized 🌿', 'color:#0f8c51;font-weight:bold;font-size:14px');
});

// ── Navigation ────────────────────────────────────────────────
function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const el = document.getElementById(name + '-content');
  if (el) el.classList.add('active');
  document.querySelectorAll(`[data-section="${name}"]`).forEach(b => b.classList.add('active'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (name === 'history')  renderHistory();
  if (name === 'medicine') renderMedicines();
  if (name === 'doctor')   loadAlertContact();
  if (name === 'privacy')  updateDataSummary();
}

// ── Offline Detection ─────────────────────────────────────────
function detectOffline() {
  function update() {
    const offline = !navigator.onLine;
    document.getElementById('offlineBar').classList.toggle('show', offline);
    document.getElementById('offlineDot').classList.toggle('show', offline);
  }
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
}

// ── Tag Selection ─────────────────────────────────────────────
function toggleTag(el, value) {
  el.classList.toggle('selected');
  if (el.classList.contains('selected')) {
    if (!selectedTags.includes(value)) selectedTags.push(value);
  } else {
    selectedTags = selectedTags.filter(t => t !== value);
  }
  document.getElementById('symptomInput').value = selectedTags.join(', ');
}

// ── Duration Selection ────────────────────────────────────────
function selectDuration(el, value) {
  document.querySelectorAll('.dur-chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  currentDuration = value;
}

// ── Severity Slider ───────────────────────────────────────────
function initSeveritySlider() {
  const slider = document.getElementById('severitySlider');
  if (!slider) return;
  slider.addEventListener('input', () => {
    document.getElementById('sevValue').textContent = slider.value + ' / 10';
    const pct = (slider.value - 1) / 9 * 100;
    slider.style.background = `linear-gradient(90deg, var(--g3) ${pct}%, var(--border) ${pct}%)`;
  });
}

// ── Low Literacy Mode ─────────────────────────────────────────
function toggleLowLiteracy() {
  isLowLiteracy = document.getElementById('lowLiteracyToggle').checked;
  document.getElementById('bodyMap').style.display = isLowLiteracy ? 'block' : 'none';
}

function addBodySymptom(area) {
  const map = { head: 'headache', chest: 'chest pain', stomach: 'stomach pain', back: 'back pain', throat: 'sore throat', limbs: 'body ache' };
  const val = map[area] || area;
  if (!selectedTags.includes(val)) selectedTags.push(val);
  document.getElementById('symptomInput').value = selectedTags.join(', ');
  document.querySelectorAll('.bzone').forEach(z => {
    if (z.dataset.sym === val) z.classList.add('selected');
  });
  speak(val + ' noted. Tap Analyze when ready.');
}

// ── Voice Guidance TTS ────────────────────────────────────────
function speak(text) {
  if (!document.getElementById('voiceGuidanceToggle')?.checked) return;
  if (!window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = currentLang === 'hi' ? 'hi-IN' : currentLang === 'te' ? 'te-IN' : 'en-IN';
  u.rate = 0.9;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

// ── Emergency ─────────────────────────────────────────────────
function closeEmergency() {
  document.getElementById('emergencyOverlay').classList.remove('show');
}

function shareLocation() {
  if (!navigator.geolocation) { alert('Location not available'); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    const url = `https://maps.google.com?q=${pos.coords.latitude},${pos.coords.longitude}`;
    const msg = `🚨 EMERGENCY: I need help! My location: ${url}`;
    if (navigator.share) {
      navigator.share({ title: 'Emergency Location', text: msg });
    } else {
      navigator.clipboard.writeText(msg).then(() => alert('Location copied! Share it with family.'));
    }
  }, () => alert('Could not get location.'));
}

// ── Explain AI ────────────────────────────────────────────────
function toggleExplain() {
  const body = document.getElementById('explainBody');
  const toggle = document.querySelector('.explain-toggle');
  const isHidden = body.style.display === 'none';
  body.style.display = isHidden ? 'block' : 'none';
  toggle.textContent = isHidden ? 'Hide ▲' : 'Show ▼';
}

// ── Save to History ───────────────────────────────────────────
function saveToHistory() {
  const title = document.getElementById('diagnosisTitle')?.textContent;
  const severity = document.querySelector('.severity-badge')?.textContent;
  const desc  = document.getElementById('diagnosisDesc')?.textContent;
  const slider = document.getElementById('severitySlider')?.value || '5';
  if (!title) return;
  const record = {
    id: Date.now(),
    date: new Date().toLocaleDateString('en-IN'),
    condition: title,
    severity: severity || '',
    severityLevel: getSeverityLevel(),
    symptoms: document.getElementById('symptomInput').value,
    description: desc,
    duration: currentDuration,
    severityScore: parseInt(slider)
  };
  const history = JSON.parse(localStorage.getItem('arogyaHistory') || '[]');
  history.unshift(record);
  localStorage.setItem('arogyaHistory', JSON.stringify(history.slice(0, 30)));
  showToast('✅ Saved to Health Record!');
}

function getSeverityLevel() {
  const badge = document.getElementById('severityBadge');
  if (!badge) return 'low';
  if (badge.classList.contains('severity-high')) return 'high';
  if (badge.classList.contains('severity-medium')) return 'medium';
  return 'low';
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  Object.assign(t.style, {
    position:'fixed', bottom:'24px', left:'50%', transform:'translateX(-50%)',
    background:' var(--ink)', color:'white', padding:'10px 20px',
    borderRadius:'20px', fontSize:'13px', fontWeight:'600',
    zIndex:'9998', boxShadow:'0 4px 20px rgba(0,0,0,0.3)',
    animation:'fadeUp 0.3s ease'
  });
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

// ── Tips Builder ──────────────────────────────────────────────
const tipsData = [
  { icon:'💧', en:['Stay Hydrated','Drink 8 glasses of clean water daily'], hi:['पानी पिएं','रोज 8 गिलास साफ पानी पिएं'], te:['నీరు తాగండి','రోజూ 8 గ్లాసుల నీరు తాగండి'] },
  { icon:'🥗', en:['Balanced Diet','Eat vegetables, fruits and whole grains'], hi:['संतुलित आहार','सब्जियां, फल और अनाज खाएं'], te:['సమతుల్య ఆహారం','కూరగాయలు, పండ్లు తినండి'] },
  { icon:'🚶', en:['Exercise Daily','30 min of walking improves heart health'], hi:['व्यायाम करें','30 मिनट चलना दिल के लिए अच्छा है'], te:['వ్యాయామం','30 నిమిషాల నడక మంచిది'] },
  { icon:'😴', en:['Sleep Well','7-8 hours of sleep boosts immunity'], hi:['अच्छी नींद','7-8 घंटे नींद रोग प्रतिरोधक क्षमता बढ़ाती है'], te:['మంచి నిద్ర','7-8 గంటల నిద్ర రోగనిరోధక శక్తిని పెంచుతుంది'] },
  { icon:'🧼', en:['Hand Hygiene','Wash hands before eating and cooking'], hi:['हाथ धोएं','खाने से पहले और बाद में हाथ धोएं'], te:['చేతులు కడగండి','తినే ముందు చేతులు కడగండి'] },
  { icon:'🌞', en:['Sun Exposure','15 min sunlight daily for Vitamin D'], hi:['धूप लें','रोज 15 मिनट धूप से विटामिन D मिलता है'], te:['ఎండ తీసుకోండి','రోజూ 15 నిమిషాల ఎండ విటమిన్ D ఇస్తుంది'] },
];

function buildTips(lang) {
  const grid = document.getElementById('tipsGrid');
  if (!grid) return;
  grid.innerHTML = tipsData.map(t => `
    <div class="tip-card">
      <div class="tip-icon">${t.icon}</div>
      <div class="tip-title">${t[lang]?.[0] || t.en[0]}</div>
      <div class="tip-desc">${t[lang]?.[1] || t.en[1]}</div>
    </div>`).join('');
}