/* ============================================================
   medicine.js — Medicine Reminders & Dosage Calculator
   Team Codecure26 | ArogyaAI | SPIRIT'26
   ============================================================ */

function addMedicine() {
  const name  = document.getElementById('medName').value.trim();
  const dose  = document.getElementById('medDose').value.trim();
  const freq  = document.getElementById('medFreq').value;
  const time  = document.getElementById('medTime').value;
  const notes = document.getElementById('medNotes').value.trim();
  if (!name || !dose) { alert('Please enter medicine name and dosage.'); return; }

  const meds = JSON.parse(localStorage.getItem('arogyaMeds') || '[]');
  meds.push({ id: Date.now(), name, dose, freq, time, notes });
  localStorage.setItem('arogyaMeds', JSON.stringify(meds));

  // Clear form
  ['medName','medDose','medTime','medNotes'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('medFreq').selectedIndex = 0;

  renderMedicines();
  showToast('💊 Medicine added!');
  scheduleReminder(name, time);
}

function scheduleReminder(name, time) {
  if (!time || !('Notification' in window)) return;
  Notification.requestPermission().then(perm => {
    if (perm === 'granted') {
      const [h, m]     = time.split(':').map(Number);
      const now        = new Date();
      const target     = new Date();
      target.setHours(h, m, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      const delay      = target - now;
      setTimeout(() => {
        new Notification('💊 ArogyaAI Medicine Reminder', {
          body: `Time to take ${name}!`,
          icon: '💊'
        });
      }, delay);
    }
  });
}

function loadMedicines() { renderMedicines(); }

function renderMedicines() {
  const meds = JSON.parse(localStorage.getItem('arogyaMeds') || '[]');
  const el   = document.getElementById('medList');
  if (!el) return;
  if (!meds.length) { el.innerHTML = '<div class="no-data-msg">No medicines added yet.</div>'; return; }

  el.innerHTML = meds.map(m => `
    <div class="med-item">
      <span class="med-icon">💊</span>
      <div class="med-info">
        <div class="med-name">${m.name} — ${m.dose}</div>
        <div class="med-meta">${m.freq}${m.time ? ' at ' + m.time : ''}${m.notes ? ' · ' + m.notes : ''}</div>
      </div>
      <button class="med-del" onclick="deleteMed(${m.id})">🗑️</button>
    </div>`).join('');
}

function deleteMed(id) {
  const meds = JSON.parse(localStorage.getItem('arogyaMeds') || '[]').filter(m => m.id !== id);
  localStorage.setItem('arogyaMeds', JSON.stringify(meds));
  renderMedicines();
}

function calcDosage() {
  const wt   = parseFloat(document.getElementById('dcWeight').value);
  const sel  = document.getElementById('dcMed');
  const opt  = sel.options[sel.selectedIndex];
  const dpm  = parseFloat(opt?.dataset?.dose || 0);
  const el   = document.getElementById('dosageResult');
  if (!wt || !dpm || !opt.value) { el.textContent = 'Enter weight and select medicine'; return; }

  const totalMg = (wt * dpm).toFixed(0);
  const unit    = opt.value.includes('ORS') ? 'ml/hour' : 'mg per dose';
  el.innerHTML  = `✅ Recommended: <strong>${totalMg} ${unit}</strong><br/><small style="font-weight:400;color:var(--g1);opacity:0.8;">Based on ${dpm}mg/kg for ${wt}kg patient. Consult a doctor before administering.</small>`;
}