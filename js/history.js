/* ============================================================
   history.js — Personal Health Record & Severity Tracker
   Mini EHR with visual chart
   Team Codecure26 | ArogyaAI | SPIRIT'26
   ============================================================ */

// ── Profile ───────────────────────────────────────────────────
function saveProfile() {
  const profile = {
    name:       document.getElementById('pName').value.trim(),
    age:        document.getElementById('pAge').value,
    gender:     document.getElementById('pGender').value,
    blood:      document.getElementById('pBlood').value,
    village:    document.getElementById('pVillage').value.trim(),
    emergency:  document.getElementById('pEmergency').value.trim(),
    allergies:  document.getElementById('pAllergies').value.trim(),
    conditions: document.getElementById('pConditions').value.trim(),
    savedAt:    new Date().toLocaleDateString('en-IN')
  };
  if (!profile.name) { alert('Please enter your name.'); return; }
  localStorage.setItem('arogyaProfile', JSON.stringify(profile));
  renderHealthIDCard(profile);
  showToast('✅ Profile saved!');
}

function loadProfile() {
  const p = JSON.parse(localStorage.getItem('arogyaProfile') || 'null');
  if (!p) return;
  ['name','age','gender','blood','village','emergency','allergies','conditions'].forEach(k => {
    const el = document.getElementById('p' + k.charAt(0).toUpperCase() + k.slice(1));
    if (el) el.value = p[k] || '';
  });
  renderHealthIDCard(p);
}

function renderHealthIDCard(p) {
  const card = document.getElementById('healthIDCard');
  const container = document.getElementById('profileSummaryCard');
  if (!card || !p.name) return;
  container.style.display = 'block';
  card.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
      <div>
        <div style="font-size:11px;opacity:0.6;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;">ArogyaAI Health ID</div>
        <div style="font-family:'Syne',sans-serif;font-size:22px;font-weight:800;">${p.name}</div>
        <div style="opacity:0.75;font-size:13px;margin-top:2px;">${p.age ? p.age + ' yrs' : ''} ${p.gender ? '· ' + p.gender : ''} ${p.blood ? '· Blood: ' + p.blood : ''}</div>
      </div>
      <div style="font-size:42px;opacity:0.2;">🌿</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:12px;opacity:0.85;">
      ${p.village   ? '<div>📍 <strong>Location:</strong> ' + p.village + '</div>' : ''}
      ${p.emergency ? '<div>📞 <strong>Emergency:</strong> ' + p.emergency + '</div>' : ''}
      ${p.allergies ? '<div>⚠️ <strong>Allergies:</strong> ' + p.allergies + '</div>' : ''}
      ${p.conditions? '<div>🏥 <strong>Conditions:</strong> ' + p.conditions + '</div>' : ''}
    </div>
    <div style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.2);font-size:11px;opacity:0.5;">
      Saved ${p.savedAt} · ArogyaAI SPIRIT'26
    </div>`;
}

// ── History ───────────────────────────────────────────────────
function loadHistory() { /* called on init */ }

function renderHistory() {
  const history = JSON.parse(localStorage.getItem('arogyaHistory') || '[]');
  renderChart(history);
  renderHistoryList(history);
}

function renderChart(history) {
  const el = document.getElementById('trackerChart');
  if (!el) return;
  if (!history.length) { el.innerHTML = '<div class="no-data-msg">No history yet. Start your first diagnosis! 🩺</div>'; return; }

  const recent = history.slice(0, 10).reverse();
  el.innerHTML = '<div class="chart-bars" id="chartBars"></div>';
  const bars = document.getElementById('chartBars');

  recent.forEach(r => {
    const score = r.severityScore || 5;
    const pct   = (score / 10) * 100;
    const cls   = r.severityLevel || 'low';
    bars.innerHTML += `
      <div class="chart-bar-wrap">
        <div class="chart-bar ${cls}" style="height:${pct}%;" data-tip="${r.condition} · ${r.date}"></div>
        <div class="chart-date">${r.date.split('/').slice(0,2).join('/')}</div>
      </div>`;
  });
}

function renderHistoryList(history) {
  const el = document.getElementById('historyList');
  if (!el) return;
  if (!history.length) { el.innerHTML = '<div class="no-data-msg">No records found. Your diagnoses will appear here.</div>'; return; }

  el.innerHTML = history.map(r => `
    <div class="history-item">
      <div class="history-dot ${r.severityLevel || 'low'}"></div>
      <div class="history-info">
        <div class="history-condition">${r.condition}</div>
        <div class="history-meta">📅 ${r.date} · ⏱️ ${r.duration || 'N/A'} · Severity ${r.severityScore || '?'}/10</div>
        <div class="history-meta" style="margin-top:4px;">${r.symptoms || ''}</div>
      </div>
      <button class="history-del" onclick="deleteRecord(${r.id})">✕</button>
    </div>`).join('');
}

function deleteRecord(id) {
  const history = JSON.parse(localStorage.getItem('arogyaHistory') || '[]').filter(r => r.id !== id);
  localStorage.setItem('arogyaHistory', JSON.stringify(history));
  renderHistory();
}

function clearHistory() {
  if (!confirm('Clear all health records?')) return;
  localStorage.removeItem('arogyaHistory');
  renderHistory();
}