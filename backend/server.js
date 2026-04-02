/* ============================================================
   server.js — Express Backend + Claude API Proxy
   Team Codecure26 | ArogyaAI | SPIRIT'26
   ============================================================ */
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const app     = express();
const PORT    = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

app.get('/api/health', (req, res) => res.json({ status:'ok', version:'2.0', project:'ArogyaAI' }));

app.post('/api/diagnose', async (req, res) => {
  const { symptoms, severity, duration } = req.body;
  if (!symptoms) return res.status(400).json({ error:'symptoms required' });
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version':'2023-06-01' },
      body: JSON.stringify({
        model:'claude-sonnet-4-20250514', max_tokens:1000,
        messages:[{ role:'user', content:`Rural health AI for India. Patient: "${symptoms}". Severity: ${severity}/10. Duration: ${duration}. Return only JSON: {"condition":"","severity":"low|medium|high","description":"","why":"","advice":[],"isEmergency":false,"confidence":80}` }]
      })
    });
    const data  = await response.json();
    const clean = (data.content?.[0]?.text||'').replace(/```json|```/g,'').trim();
    res.json({ success:true, diagnosis: JSON.parse(clean) });
  } catch(e) {
    res.status(500).json({ error:'AI unavailable', fallback:true });
  }
});

app.listen(PORT, () => console.log(`ArogyaAI running → http://localhost:${PORT}`));