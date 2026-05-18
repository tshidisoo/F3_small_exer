/* ══════════════════════════════════════════
   English Test – Units 1 & 2  |  script.js
   ══════════════════════════════════════════ */

(function () {
  'use strict';

  const TOTAL = 30;

  /* ── Gather all question cards ── */
  const cards = Array.from(document.querySelectorAll('.q-card'));
  const form  = document.getElementById('testForm');

  /* ── Progress tracking ── */
  const answeredCountEl = document.getElementById('answeredCount');
  const progressFill    = document.getElementById('progressFill');
  let answered = new Set();

  /* ── Live selection highlight + progress ── */
  cards.forEach(card => {
    const qNum   = card.dataset.q;
    const labels = card.querySelectorAll('.choices label');
    const radios = card.querySelectorAll('input[type="radio"]');

    radios.forEach((radio, idx) => {
      radio.addEventListener('change', () => {
        /* highlight selected */
        labels.forEach(l => l.classList.remove('selected'));
        labels[idx].classList.add('selected');

        /* track progress */
        answered.add(qNum);
        answeredCountEl.textContent = answered.size;
        progressFill.style.width = ((answered.size / TOTAL) * 100) + '%';
      });
    });
  });

  /* ── SUBMIT ── */
  form.addEventListener('submit', e => {
    e.preventDefault();

    /* Check all answered */
    const unanswered = cards.filter(c => {
      const q = c.dataset.q;
      return !document.querySelector(`input[name="q${q}"]:checked`);
    });

    if (unanswered.length > 0) {
      unanswered.forEach(c => c.classList.add('unanswered'));
      unanswered[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      unanswered[0].style.animation = 'shake 0.4s ease';
      setTimeout(() => { unanswered[0].style.animation = ''; }, 400);

      /* Add shake keyframes if missing */
      if (!document.getElementById('shakeStyle')) {
        const s = document.createElement('style');
        s.id = 'shakeStyle';
        s.textContent = `
          @keyframes shake {
            0%,100%{transform:translateX(0)}
            20%{transform:translateX(-6px)}
            40%{transform:translateX(6px)}
            60%{transform:translateX(-4px)}
            80%{transform:translateX(4px)}
          }`;
        document.head.appendChild(s);
      }
      return;
    }

    gradeTest();
  });

  /* ── GRADING ── */
  function gradeTest() {
    /* Section scores */
    const sections = [
      { name: '🌍 Countries & be',     qs: range(1, 10),  color: '#3B82F6' },
      { name: '❓ Questions with be',  qs: range(11, 15), color: '#22C55E' },
      { name: '🔤 Consonant Clusters', qs: range(16, 22), color: '#F59E0B' },
      { name: '❤️ Likes & Dislikes',   qs: range(23, 30), color: '#EC4899' },
    ];

    let totalScore = 0;
    const sectionScores = [];

    cards.forEach(card => {
      const q       = card.dataset.q;
      const correct = parseInt(card.dataset.answer);
      const chosen  = document.querySelector(`input[name="q${q}"]:checked`);
      const val     = chosen ? parseInt(chosen.value) : -1;
      const labels  = card.querySelectorAll('.choices label');

      /* remove unanswered highlight */
      card.classList.remove('unanswered');

      /* Mark all radios disabled */
      card.querySelectorAll('input[type="radio"]').forEach(r => r.disabled = true);

      /* Clear selected highlight */
      labels.forEach(l => l.classList.remove('selected'));

      if (val === correct) {
        card.classList.add('correct');
        labels[correct].classList.add('correct-ans');
        totalScore++;
        addFeedback(card, true);
      } else {
        card.classList.add('wrong');
        labels[correct].classList.add('correct-ans');
        if (val >= 0) labels[val].classList.add('wrong-ans');
        addFeedback(card, false, labels[correct].textContent.trim());
      }
    });

    /* Per-section breakdown */
    sections.forEach(sec => {
      let got = 0;
      sec.qs.forEach(qn => {
        const c = document.querySelector(`.q-card[data-q="${qn}"]`);
        if (c && c.classList.contains('correct')) got++;
      });
      sectionScores.push({ ...sec, got, total: sec.qs.length });
    });

    showResult(totalScore, sectionScores);
  }

  function addFeedback(card, isOk, correctText) {
    const existing = card.querySelector('.q-feedback');
    if (existing) existing.remove();
    const div = document.createElement('div');
    div.className = 'q-feedback ' + (isOk ? 'ok' : 'bad');
    div.innerHTML = isOk
      ? '✅ Correct!'
      : `❌ Incorrect. Answer: <strong>${correctText}</strong>`;
    card.querySelector('.choices').after(div);
  }

  /* ── RESULT SCREEN ── */
  function showResult(score, sectionScores) {
    form.style.display = 'none';
    const resultScreen = document.getElementById('resultScreen');
    resultScreen.hidden = false;

    /* Trophy & title */
    const pct = score / TOTAL;
    let emoji, title, msg;
    if (pct === 1)        { emoji = '🏆'; title = 'Perfect Score!';   msg = 'Outstanding! You got every single question right!'; }
    else if (pct >= 0.8)  { emoji = '🌟'; title = 'Excellent Work!';  msg = 'Amazing effort — you really know your stuff!'; }
    else if (pct >= 0.6)  { emoji = '👏'; title = 'Good Job!';        msg = 'Well done! Keep practising to improve even more.'; }
    else if (pct >= 0.4)  { emoji = '📚'; title = 'Keep Trying!';     msg = 'Not bad — review the sections you found tricky.'; }
    else                   { emoji = '💪'; title = 'Keep Practising!'; msg = 'Don\'t give up! Review the lessons and try again.'; }

    document.getElementById('trophyEmoji').textContent = emoji;
    document.getElementById('resultTitle').textContent = title;
    document.getElementById('bigScore').textContent    = score + '/30';
    document.getElementById('resultMsg').textContent   = msg;

    /* Section breakdown */
    const bd = document.getElementById('resultBreakdown');
    bd.innerHTML = '';
    sectionScores.forEach(s => {
      const div = document.createElement('div');
      div.className = 'breakdown-item';
      div.style.background = s.color + '22';
      div.style.color = s.color;
      div.style.border = `2px solid ${s.color}44`;
      div.textContent = `${s.name}: ${s.got}/${s.total}`;
      bd.appendChild(div);
    });

    resultScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ── RETRY ── */
  document.getElementById('retryBtn').addEventListener('click', () => {
    location.reload();
  });

  /* ── HELPERS ── */
  function range(a, b) {
    const r = [];
    for (let i = a; i <= b; i++) r.push(i);
    return r;
  }

})();
