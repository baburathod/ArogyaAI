/* ============================================================
   voice.js — Voice-First Conversational AI
   Web Speech API + Orb UI feedback
   Team Codecure26 | ArogyaAI | SPIRIT'26
   ============================================================ */

let recognition = null;
let isListening  = false;
let convMode     = false;

const speechLocales = { en:'en-IN', hi:'hi-IN', te:'te-IN' };

// ── Conversational Orb ────────────────────────────────────────
function toggleConversation() {
  convMode = !convMode;
  if (convMode) {
    startListening(true);
  } else {
    if (recognition) recognition.stop();
    resetOrb();
  }
}

function startListening(conv) {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Voice input requires Google Chrome.'); return;
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.lang = speechLocales[currentLang] || 'en-IN';
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    isListening = true;
    document.getElementById('voiceOrb').classList.add('listening');
    document.getElementById('orbIcon').textContent  = '🔴';
    document.getElementById('orbLabel').textContent = 'Listening...';
    document.getElementById('micBtn').classList.add('listening');
    document.getElementById('micBtn').textContent = '🔴';
  };

  recognition.onresult = (e) => {
    const interim = Array.from(e.results).map(r => r[0].transcript).join('');
    document.getElementById('voiceTranscript').textContent = '🎙️ ' + interim;
    if (e.results[e.results.length - 1].isFinal) {
      const final = e.results[e.results.length - 1][0].transcript;
      document.getElementById('symptomInput').value = final;
      document.getElementById('voiceTranscript').textContent = '✅ Captured: ' + final;
      selectedTags = [];
    }
  };

  recognition.onend = () => {
    isListening = false;
    resetOrb();
    if (conv && convMode) {
      // Auto-analyze after voice in conversation mode
      setTimeout(() => {
        const val = document.getElementById('symptomInput').value.trim();
        if (val) analyzeSymptoms();
      }, 500);
    }
  };

  recognition.onerror = (e) => {
    isListening = false;
    resetOrb();
    if (e.error === 'not-allowed') alert('Please allow microphone access in browser settings.');
  };

  recognition.start();
}

function resetOrb() {
  document.getElementById('voiceOrb').classList.remove('listening');
  document.getElementById('orbIcon').textContent  = '🎤';
  document.getElementById('orbLabel').textContent = convMode ? 'Tap to Stop' : 'Tap to Speak';
  document.getElementById('micBtn').classList.remove('listening');
  document.getElementById('micBtn').textContent = '🎤';
  convMode = false;
}

// ── Inline Mic Button ─────────────────────────────────────────
function toggleVoice() {
  if (isListening) { recognition?.stop(); return; }
  startListening(false);
}