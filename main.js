/* ── Cursor blob ── */
const blob = document.getElementById('blob');
let mx = window.innerWidth / 2, my = window.innerHeight / 2;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
(function loop() {
  blob.style.left = mx + 'px';
  blob.style.top  = my + 'px';
  requestAnimationFrame(loop);
})();

/* ── Scroll reveal ── */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal, .reveal-left').forEach(el => revealObs.observe(el));

/* ── Counter animation ── */
function runCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = +el.dataset.count;
    let v = 0;
    const step = Math.max(1, Math.ceil(target / 35));
    const t = setInterval(() => {
      v = Math.min(v + step, target);
      el.textContent = v + '+';
      if (v >= target) clearInterval(t);
    }, 28);
  });
}
const statsObs = new IntersectionObserver(e => {
  if (e[0].isIntersecting) { runCounters(); statsObs.disconnect(); }
}, { threshold: 0.5 });
const statsEl = document.querySelector('.stats-strip');
if (statsEl) statsObs.observe(statsEl);

/* ── Tab switching ── */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

/* ── Terminal typewriter ── */
const termLines = [
  { type: 'cmd',  text: 'whoami' },
  { type: 'out',  text: 'Dan Mcley Pangan — Developer', cls: 'hi' },
  { type: 'cmd',  text: 'ls ./skills' },
  { type: 'out',  text: 'react/  laravel/  flutter/  vue/', cls: '' },
  { type: 'cmd',  text: 'cat status.txt' },
  { type: 'out',  text: '[✓] Open to work', cls: 'ok' },
  { type: 'out',  text: '[✓] Building cool things', cls: 'ok' },
  { type: 'out',  text: '[~] Drinking coffee', cls: 'warn' },
  { type: 'cmd',  text: '', cursor: true },
];
const termEl = document.getElementById('terminal-body');
let li = 0;
function typeNext() {
  if (li >= termLines.length) return;
  const line = termLines[li];
  if (line.cursor) {
    termEl.innerHTML += `<div class="t-line"><span class="t-prompt">❯</span><span class="t-cmd"><span class="t-cursor"></span></span></div>`;
    return;
  }
  if (line.type === 'cmd') {
    const div = document.createElement('div');
    div.className = 't-line';
    div.innerHTML = `<span class="t-prompt">❯</span><span class="t-cmd"></span>`;
    termEl.appendChild(div);
    const cmdSpan = div.querySelector('.t-cmd');
    let i = 0;
    const t = setInterval(() => {
      cmdSpan.textContent += line.text[i++];
      if (i >= line.text.length) { clearInterval(t); li++; setTimeout(typeNext, 200); }
    }, 60);
  } else {
    const div = document.createElement('div');
    div.className = `t-out${line.cls ? ' ' + line.cls : ''}`;
    div.textContent = line.text;
    termEl.appendChild(div);
    li++; setTimeout(typeNext, 120);
  }
}
setTimeout(typeNext, 900);

/* ── Active nav on scroll ── */
const secIds = ['hero', 'projects', 'about', 'contact'];
window.addEventListener('scroll', () => {
  const sy = window.scrollY + 80;
  let cur = 'hero';
  secIds.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.offsetTop <= sy) cur = id;
  });
  document.querySelectorAll('.nav-center a').forEach(a => {
    a.style.color = a.getAttribute('href') === '#' + cur ? 'var(--cyan)' : '';
    a.style.background = a.getAttribute('href') === '#' + cur ? 'var(--cyan-dim)' : '';
  });
}, { passive: true });

/* ══════════════════════════════════════════
   PROJECT MODAL / LIGHTBOX
══════════════════════════════════════════ */

/*
  PROJECT DATA
  Add your real images and captions here.
  Each project has an id (matches data-project on the card),
  a title, and an array of slides.
  Each slide: { src, caption } — caption is optional.
*/
const projectData = {
  boheco_web: {
    title: 'BOHECO 1 — Election System (Web)',
    slides: [
      { src: 'BOHECO pic 1.jpg', caption: 'Presented our project to the ICT and CORPLAN Manager of BOHECO 1 with the dean and teachers of Mater Dei College' },
      { src: 'BOHECO pic 2.jpg', caption: 'We recieved feedback and praise for completing our project successfully' },
      { src: 'BOHECO group pic.jpg', caption: 'Project delivered to the client' },
      { src: 'BOHECO pic 3.jpg', caption: 'We presented our project again this time to the HR Department and person in charge in the election of Board of Directors'},
    ]
  },
  prisaa: {
    title: 'PRISAA BOHOL Sports Website',
    slides: [
      { src: 'PRISAA group pic.jpg', caption: 'Group photo of our team together with a PRISAA representative after our Capstone Presentation' },
      { src: 'PRISAA pic 1.jpg', caption: 'We taught him, how to navigate in the website' },
      { src: 'PRISAA pic 2.jpg', caption: 'Capstone project delivered to a PRISAA representative' },
      // { src: 'prisaa-home.jpg', caption: 'Homepage design.' },
    ]
  },
  boheco_mobile: {
    title: 'BOHECO 1 — Election System (Mobile)',
    slides: [
      { src: 'BOHECO mobile pic.jpg', caption: 'Voter Interface, we put click to touch and a given account, for it to automatically connect to the web system' },
      // { src: 'boheco-vote-screen.jpg', caption: 'Ballot selection screen.' },
    ]
  },
};

/* ── Build modal HTML once and append to body ── */
const modalHTML = `
<div class="modal-overlay" id="projectModal" role="dialog" aria-modal="true" aria-label="Project gallery">
  <div class="modal-box" id="modalBox">
    <div class="modal-header">
      <span class="modal-title" id="modalTitle"></span>
      <button class="modal-close" id="modalClose" aria-label="Close">&times;</button>
    </div>
    <div class="modal-gallery">
      <div class="modal-gallery-track" id="modalTrack"></div>
      <button class="modal-nav prev" id="modalPrev" aria-label="Previous">&#8592;</button>
      <button class="modal-nav next" id="modalNext" aria-label="Next">&#8594;</button>
    </div>
    <div class="modal-dots" id="modalDots"></div>
    <div class="modal-caption" id="modalCaption"></div>
  </div>
</div>`;
document.body.insertAdjacentHTML('beforeend', modalHTML);

const modalOverlay = document.getElementById('projectModal');
const modalBox     = document.getElementById('modalBox');
const modalTitle   = document.getElementById('modalTitle');
const modalTrack   = document.getElementById('modalTrack');
const modalPrev    = document.getElementById('modalPrev');
const modalNext    = document.getElementById('modalNext');
const modalDots    = document.getElementById('modalDots');
const modalCaption = document.getElementById('modalCaption');

let currentSlides = [];
let currentIndex  = 0;

function openModal(projectId) {
  const data = projectData[projectId];
  if (!data) return;

  currentSlides = data.slides;
  currentIndex  = 0;

  /* Title */
  modalTitle.textContent = data.title;

  /* Slides */
  modalTrack.innerHTML = currentSlides.map(s =>
    `<div class="modal-slide"><img src="${s.src}" alt="${s.caption || ''}" loading="lazy"></div>`
  ).join('');

  /* Dots */
  modalDots.innerHTML = currentSlides.map((_, i) =>
    `<button class="modal-dot${i === 0 ? ' active' : ''}" data-i="${i}" aria-label="Slide ${i+1}"></button>`
  ).join('');
  if (currentSlides.length <= 1) modalDots.style.display = 'none';
  else modalDots.style.display = 'flex';

  updateModal(0);

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  /* Focus trap start */
  modalBox.querySelector('button').focus();
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

function updateModal(idx) {
  currentIndex = idx;
  const slide = currentSlides[idx];

  modalTrack.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1)';
  modalTrack.style.transform = `translateX(-${idx * 100}%)`;

  modalPrev.disabled = idx === 0;
  modalNext.disabled = idx === currentSlides.length - 1;

  modalDots.querySelectorAll('.modal-dot').forEach((d, i) => {
    d.classList.toggle('active', i === idx);
  });

  const hasCaption = slide.caption && slide.caption.trim();
  modalCaption.style.display = (hasCaption || currentSlides.length > 1) ? '' : 'none';
  modalCaption.innerHTML = `
    ${hasCaption ? `<p class="modal-caption-text">${slide.caption}</p>` : ''}
    ${currentSlides.length > 1 ? `<p class="modal-counter">${idx + 1} / ${currentSlides.length}</p>` : ''}
  `;
}

/* Nav clicks */
modalPrev.addEventListener('click', () => { if (currentIndex > 0) updateModal(currentIndex - 1); });
modalNext.addEventListener('click', () => { if (currentIndex < currentSlides.length - 1) updateModal(currentIndex + 1); });

/* Dot clicks */
modalDots.addEventListener('click', e => {
  const dot = e.target.closest('.modal-dot');
  if (dot) updateModal(+dot.dataset.i);
});

/* Close on overlay click (outside box) */
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

/* Close button */
document.getElementById('modalClose').addEventListener('click', closeModal);

/* Keyboard: Escape + arrow keys */
document.addEventListener('keydown', e => {
  if (!modalOverlay.classList.contains('open')) return;
  if (e.key === 'Escape') closeModal();
  if (e.key === 'ArrowLeft'  && currentIndex > 0) updateModal(currentIndex - 1);
  if (e.key === 'ArrowRight' && currentIndex < currentSlides.length - 1) updateModal(currentIndex + 1);
});

/* ── Attach click listeners to project cards ── */
/* Map each card to its project id via data-project attribute */
document.querySelectorAll('[data-project]').forEach(card => {
  card.style.cursor = 'pointer';
  card.addEventListener('click', () => openModal(card.dataset.project));
});