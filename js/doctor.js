/* ============================================================
   doctor.js — Auto Alert System + Emergency Contact
   SMS via tel: link, location sharing, eSanjeevani bridge
   Team Codecure26 | ArogyaAI | SPIRIT'26
   ============================================================ */

function saveAlertContact() {
  const name  = document.getElementById('alertName').value.trim();
  const phone = document.getElementById('alertPhone').value.trim();
  if (!name || !phone) { alert('Please enter contact name and phone number.'); return; }

  localStorage.setItem('arogyaAlertContact', JSON.stringify({ name, phone }));

  // Update status UI
  document.getElementById('alertStatusText').textContent = `✅ Alert contact saved: ${name} (${phone})`;
  document.getElementById('alertStatus').querySelector('.alert-status-dot').className = 'alert-status-dot idle';

  showToast(`📲 Alert system active for ${name}`);

  // Test: trigger a demo SMS
  const testMsg = `🌿 ArogyaAI Test Alert\nHello! ${name} has set you as their emergency contact in ArogyaAI.\nIf you receive a future message from this number, please respond immediately.`;
  if (confirm(`Send a test SMS to ${phone}?\n\nThis will open your SMS app with a pre-filled message.`)) {
    window.open(`sms:${phone}?body=${encodeURIComponent(testMsg)}`, '_blank');
  }
}

// Called from app.js / diagnosis.js when emergency is triggered
function triggerEmergencyAlert(condition) {
  const contact = JSON.parse(localStorage.getItem('arogyaAlertContact') || 'null');
  if (!contact) return;

  const profile = JSON.parse(localStorage.getItem('arogyaProfile') || 'null');
  const patientName = profile?.name || 'A user';

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const loc = `https://maps.google.com?q=${pos.coords.latitude},${pos.coords.longitude}`;
      sendAlert(contact, patientName, condition, loc);
    }, () => sendAlert(contact, patientName, condition, null));
  } else {
    sendAlert(contact, patientName, condition, null);
  }
}

function sendAlert(contact, patientName, condition, locationUrl) {
  const locText = locationUrl ? `\n📍 Location: ${locationUrl}` : '';
  const msg = `🚨 EMERGENCY ALERT from ArogyaAI\n\n${patientName} may need urgent medical help!\nCondition detected: ${condition}${locText}\n\nPlease call them immediately or dial 108 on their behalf.\n\n- ArogyaAI Health Assistant`;

  // Open SMS app with pre-filled message
  window.open(`sms:${contact.phone}?body=${encodeURIComponent(msg)}`, '_blank');

  // Update alert status
  const statusEl = document.getElementById('alertStatusText');
  const dotEl    = document.getElementById('alertStatus')?.querySelector('.alert-status-dot');
  if (statusEl) statusEl.textContent = `🚨 Alert sent to ${contact.name} at ${new Date().toLocaleTimeString()}`;
  if (dotEl)    dotEl.className = 'alert-status-dot active';
}

function sendSMSAlert() {
  const contact = JSON.parse(localStorage.getItem('arogyaAlertContact') || 'null');
  if (!contact) {
    alert('No emergency contact saved!\nGo to 🧑‍⚕️ Doctor tab and add your emergency contact first.');
    return;
  }
  const condition = document.getElementById('diagnosisTitle')?.textContent || 'Critical Symptoms';
  triggerEmergencyAlert(condition);
}

// Load saved contact on Doctor section open
function loadAlertContact() {
  const contact = JSON.parse(localStorage.getItem('arogyaAlertContact') || 'null');
  if (!contact) return;
  const nameEl  = document.getElementById('alertName');
  const phoneEl = document.getElementById('alertPhone');
  if (nameEl)  nameEl.value  = contact.name;
  if (phoneEl) phoneEl.value = contact.phone;
  const statusEl = document.getElementById('alertStatusText');
  if (statusEl) statusEl.textContent = `✅ Alert contact saved: ${contact.name} (${contact.phone})`;
}