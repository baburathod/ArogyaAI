/* ============================================================
   hospitals.js — Smart Hospital Recommender
   Matches hospital TYPE to diagnosed condition
   Team Codecure26 | ArogyaAI | SPIRIT'26
   ============================================================ */

const HOSPITAL_TYPES = {
  cardiology: { label:'🫀 Cardiology Centre', priority:'URGENT – Cardiac Care Needed' },
  emergency:  { label:'🚨 Emergency Department', priority:'URGENT – Go Immediately' },
  ortho:      { label:'🦴 Orthopaedic Clinic', priority:'Specialised Care Recommended' },
  general:    { label:'🏥 General Hospital / PHC', priority:'General OPD Available' }
};

function findHospitals() {
  const btn = document.getElementById('locateBtn');
  btn.innerHTML = '⏳ Detecting location...';
  btn.disabled = true;

  if (!navigator.geolocation) { showStaticHospitals(); return; }

  navigator.geolocation.getCurrentPosition(
    onLocationSuccess,
    () => showStaticHospitals(),
    { timeout: 8000, enableHighAccuracy: true }
  );
}

function onLocationSuccess(pos) {
  const { latitude: lat, longitude: lng } = pos.coords;
  document.getElementById('locateBtn').style.display = 'none';

  const bboxStr  = (lng-0.05)+','+(lat-0.05)+','+(lng+0.05)+','+(lat+0.05);
  const osmEmbed = 'https://www.openstreetmap.org/export/embed.html?bbox='+bboxStr+'&layer=mapnik&marker='+lat+','+lng;
  const osmFull  = 'https://www.openstreetmap.org/?mlat='+lat+'&mlon='+lng+'#map=14/'+lat+'/'+lng;
  const gSearch  = 'https://www.google.com/maps/search/hospital+near+me/@'+lat+','+lng+',14z';

  const htype    = window.lastHospitalType || 'general';
  const htypeInfo = HOSPITAL_TYPES[htype] || HOSPITAL_TYPES.general;

  const hospitals = [
    { name:'Government Primary Health Centre', dist:'~0.8 km', open:'Open 24/7', fee:'Free', badge:'badge-matched', match: htype === 'general' },
    { name:'Community Health Centre (CHC)',    dist:'~2.1 km', open:'8AM–8PM',   fee:'Free', badge:'badge-nearby',  match: false },
    { name:'District Hospital',                dist:'~5.4 km', open:'Open 24/7', fee:'Free', badge: htype !== 'general' ? 'badge-matched':'badge-nearby', match: htype !== 'general' },
    { name:'ASHA Health Worker',               dist:'~0.3 km', open:'Call 104',  fee:'Free', badge:'badge-nearby',  match: false }
  ].sort((a,b) => b.match - a.match);

  document.getElementById('hospitalList').innerHTML = `
    <div style="background:var(--g-pale);border:1px solid #b2ddc4;border-radius:12px;padding:12px 14px;margin:14px 0;font-size:13px;color:var(--g1);">
      <strong>🎯 Matched for your condition:</strong> ${htypeInfo.label}<br/>
      <span style="color:var(--red);font-weight:600;">${htypeInfo.priority}</span>
    </div>
    <div style="border-radius:12px;overflow:hidden;margin-bottom:12px;border:1px solid var(--border);">
      <iframe width="100%" height="200" style="border:0;" loading="lazy" src="${osmEmbed}"></iframe>
    </div>
    <p style="font-size:12px;color:var(--ink-muted);margin-bottom:14px;text-align:center;">
      📍 Your location detected &nbsp;·&nbsp;
      <a href="${osmFull}" target="_blank" style="color:var(--blue);">Open in OSM</a> &nbsp;·&nbsp;
      <a href="${gSearch}" target="_blank" style="color:var(--blue);">Google Maps</a>
    </p>
    <div class="hospital-grid">
      ${hospitals.map(h => `
        <div class="hospital-card">
          <span class="hospital-badge ${h.badge}">${h.match ? '✅ Best Match' : '📍 Nearby'}</span>
          <div class="hospital-name">🏥 ${h.name}</div>
          <div class="hospital-meta">
            <span>📍 ${h.dist}</span><span>🕐 ${h.open}</span><span>💰 ${h.fee}</span>
          </div>
          <a class="directions-btn"
             href="https://www.google.com/maps/search/${encodeURIComponent(h.name)}/@${lat},${lng},14z"
             target="_blank">Get Directions</a>
        </div>`).join('')}
    </div>`;
}

function showStaticHospitals() {
  document.getElementById('locateBtn').style.display = 'none';
  document.getElementById('hospitalList').innerHTML = `
    <p style="font-size:13px;color:var(--ink-muted);margin-bottom:14px;">📍 Location unavailable — showing national resources:</p>
    <div class="hospital-grid">
      <div class="hospital-card">
        <span class="hospital-badge badge-matched">✅ Primary Care</span>
        <div class="hospital-name">🏥 Government PHC</div>
        <div class="hospital-meta"><span>📞 104</span><span>Free OPD</span></div>
        <a class="directions-btn" href="https://www.google.com/maps/search/government+primary+health+centre" target="_blank">Find Nearest</a>
      </div>
      <div class="hospital-card">
        <span class="hospital-badge badge-nearby">🚨 Emergency</span>
        <div class="hospital-name">🚑 Ambulance</div>
        <div class="hospital-meta"><span>📞 108</span><span>24/7</span></div>
        <a class="directions-btn" href="tel:108">Call 108</a>
      </div>
      <div class="hospital-card">
        <span class="hospital-badge badge-nearby">💊 Medicine</span>
        <div class="hospital-name">💊 Jan Aushadhi</div>
        <div class="hospital-meta"><span>Affordable Medicines</span></div>
        <a class="directions-btn" href="https://www.google.com/maps/search/jan+aushadhi+store" target="_blank">Find Nearest</a>
      </div>
      <div class="hospital-card">
        <span class="hospital-badge badge-nearby">📞 Helpline</span>
        <div class="hospital-name">👩‍⚕️ Health Helpline</div>
        <div class="hospital-meta"><span>📞 104</span><span>Free</span></div>
        <a class="directions-btn" href="tel:104">Call 104</a>
      </div>
    </div>`;
}