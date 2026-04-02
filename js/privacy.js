/* ============================================================
   privacy.js — Data Privacy, Export, Deletion
   Basic encoding, user data control
   Team Codecure26 | ArogyaAI | SPIRIT'26
   ============================================================ */

// ── Encoded Storage Helpers ───────────────────────────────────
// Basic Base64 encoding to avoid plain-text exposure in browser
function encodeData(data) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}
function decodeData(str) {
  try { return JSON.parse(decodeURIComponent(escape(atob(str)))); }
  catch { return null; }
}

// Secure-save wrapper (used optionally for sensitive fields)
function secureSave(key, data) {
  localStorage.setItem(key, encodeData(data));
}
function secureLoad(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try { return decodeData(raw); } catch { return null; }
}

// ── Export All Data ───────────────────────────────────────────
function exportData() {
  const allData = {
    exportedAt:    new Date().toISOString(),
    app:           'ArogyaAI v2.0 — Team InnovX',
    profile:       JSON.parse(localStorage.getItem('arogyaProfile')  || 'null'),
    history:       JSON.parse(localStorage.getItem('arogyaHistory')  || '[]'),
    medicines:     JSON.parse(localStorage.getItem('arogyaMeds')     || '[]'),
    alertContact:  JSON.parse(localStorage.getItem('arogyaAlertContact') || 'null'),
  };

  const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `ArogyaAI_HealthData_${new Date().toLocaleDateString('en-IN').replace(/\//g,'-')}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📤 Health data exported!');
}

// ── Delete All Data ───────────────────────────────────────────
function deleteAllData() {
  if (!confirm('⚠️ This will permanently delete ALL your health data from this device.\n\nAre you absolutely sure?')) return;
  ['arogyaProfile','arogyaHistory','arogyaMeds','arogyaAlertContact','lastDiagnosis'].forEach(k => localStorage.removeItem(k));
  updateDataSummary();
  showToast('🗑️ All data deleted.');
}

// ── Data Summary ──────────────────────────────────────────────
function updateDataSummary() {
  const el = document.getElementById('dataSummary');
  if (!el) return;
  const profile  = JSON.parse(localStorage.getItem('arogyaProfile')  || 'null');
  const history  = JSON.parse(localStorage.getItem('arogyaHistory')  || '[]');
  const meds     = JSON.parse(localStorage.getItem('arogyaMeds')     || '[]');
  el.innerHTML   = `
    📦 <strong>Stored on this device:</strong>
    Profile: ${profile ? '✅ Saved' : '—'} &nbsp;·&nbsp;
    Diagnoses: ${history.length} records &nbsp;·&nbsp;
    Medicines: ${meds.length} items &nbsp;·&nbsp;
    Storage used: ~${(JSON.stringify(localStorage).length / 1024).toFixed(1)} KB`;
}

// Run on page load + when Privacy section is shown
document.addEventListener('DOMContentLoaded', updateDataSummary);