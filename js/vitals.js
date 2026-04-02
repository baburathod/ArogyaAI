/* ============================================================
   vitals.js — BMI, Heart Rate, BP, Temperature, SpO2
   Team Codecure26 | ArogyaAI | SPIRIT'26
   ============================================================ */

function calcBMI() {
  const h = parseFloat(document.getElementById('vHeight').value);
  const w = parseFloat(document.getElementById('vWeight').value);
  if (!h || !w || h < 50 || w < 10) return;

  const bmi = w / ((h/100) ** 2);
  const bmiEl = document.getElementById('bmiResult');
  const gaugeWrap = document.getElementById('bmiGaugeWrap');
  const needle    = document.getElementById('bmiNeedle');

  let label, color, pct;
  if      (bmi < 18.5) { label='Underweight'; color='#60a5fa'; pct=15; }
  else if (bmi < 25)   { label='Normal';       color='#4ade80'; pct=38; }
  else if (bmi < 30)   { label='Overweight';   color='#fbbf24'; pct=62; }
  else                  { label='Obese';        color='#f87171'; pct=85; }

  bmiEl.textContent = bmi.toFixed(1) + ' — ' + label;
  bmiEl.style.color = color;
  gaugeWrap.style.display = 'block';
  needle.style.left = pct + '%';
}

function assessHR() {
  const hr = parseInt(document.getElementById('vHR').value);
  const el = document.getElementById('hrResult');
  if (!hr) { el.textContent = ''; el.className = 'vital-result'; return; }

  if      (hr < 60)  { el.textContent = '⬇️ Bradycardia — Heart rate is low. Consult a doctor.';   el.className = 'vital-result vital-warning'; }
  else if (hr <= 100) { el.textContent = '✅ Normal Heart Rate (' + hr + ' BPM)';                    el.className = 'vital-result vital-ok'; }
  else if (hr <= 130) { el.textContent = '⬆️ Elevated — Rest and monitor. May indicate stress/fever.'; el.className = 'vital-result vital-warning'; }
  else                { el.textContent = '🚨 Tachycardia — Seek medical attention immediately!';      el.className = 'vital-result vital-danger'; }
}

function assessBP() {
  const sys = parseInt(document.getElementById('vSys').value);
  const dia = parseInt(document.getElementById('vDia').value);
  const el  = document.getElementById('bpResult');
  if (!sys || !dia) { el.textContent = ''; el.className = 'vital-result'; return; }

  if      (sys < 90  || dia < 60)  { el.textContent = '⬇️ Low BP ('+sys+'/'+dia+') — Drink ORS, rest, see doctor if persistent.'; el.className = 'vital-result vital-warning'; }
  else if (sys <= 120 && dia <= 80) { el.textContent = '✅ Normal BP ('+sys+'/'+dia+')';  el.className = 'vital-result vital-ok'; }
  else if (sys <= 139 || dia <= 89) { el.textContent = '⚠️ Pre-hypertension ('+sys+'/'+dia+') — Monitor and reduce salt.'; el.className = 'vital-result vital-warning'; }
  else                               { el.textContent = '🚨 High BP ('+sys+'/'+dia+') — Consult doctor urgently!'; el.className = 'vital-result vital-danger'; }
}

function assessTemp() {
  const t  = parseFloat(document.getElementById('vTemp').value);
  const el = document.getElementById('tempResult');
  if (!t) { el.textContent = ''; el.className = 'vital-result'; return; }

  if      (t < 96)  { el.textContent = '🥶 Hypothermia — Keep warm, seek medical care.'; el.className = 'vital-result vital-danger'; }
  else if (t <= 99)  { el.textContent = '✅ Normal Temperature (' + t + '°F)';             el.className = 'vital-result vital-ok'; }
  else if (t <= 102) { el.textContent = '🌡️ Mild Fever (' + t + '°F) — Rest, fluids, Paracetamol.'; el.className = 'vital-result vital-warning'; }
  else if (t <= 104) { el.textContent = '🔥 High Fever (' + t + '°F) — See doctor today!'; el.className = 'vital-result vital-danger'; }
  else               { el.textContent = '🚨 Dangerously High (' + t + '°F) — Emergency care NOW!'; el.className = 'vital-result vital-danger'; }
}

function assessSpo2() {
  const s  = parseInt(document.getElementById('vSpo2').value);
  const el = document.getElementById('spo2Result');
  if (!s)  { el.textContent = ''; el.className = 'vital-result'; return; }

  if      (s >= 95) { el.textContent = '✅ Normal SpO2 (' + s + '%) — Good oxygen levels.';      el.className = 'vital-result vital-ok'; }
  else if (s >= 90) { el.textContent = '⚠️ Low SpO2 (' + s + '%) — Sit up, breathe deeply.';    el.className = 'vital-result vital-warning'; }
  else              { el.textContent = '🚨 Critical SpO2 (' + s + '%) — Seek emergency care NOW!'; el.className = 'vital-result vital-danger'; }
}