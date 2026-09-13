/* ══════════════════════════════════════════════════════════
   WEDDING INVITATION SCRIPT
   Quốc Du & Phương Ly — 28/11/2026
   ══════════════════════════════════════════════════════════ */

'use strict';

// ── Config ─────────────────────────────────────────────────
const WEDDING_DATE = new Date('2026-11-28T17:00:00+07:00');

const GALLERY_PHOTOS = [
  'assets/IMG_5993.JPG',
  'assets/co_dau.jpeg',
  'assets/IMG_6016.JPG',
  'assets/IMG_5974.JPG',
  'assets/IMG_5928.JPG',
  'assets/IMG_5914.JPG',
  'assets/IMG_5909.JPG',
  'assets/IMG_5905.JPG',
  'assets/IMG_5957.JPG',
  'assets/IMG_5955.JPG',
  'assets/IMG_5956.JPG',
  'assets/IMG_5958.JPG',
  'assets/IMG_6031.JPG',
  'assets/IMG_6035.JPG',
  'assets/04A53ADC-0B72-48EB-A723-3DA3E18B9182.jpeg',
  'assets/chu_re.JPG',
];

// ── State ───────────────────────────────────────────────────
let galleryIndex   = 0;
let cdTimer        = null;
let musicPlaying   = false;
let audioEl        = null;
let petalRAF       = null;
const STORAGE_KEY  = 'wedding_wishes_qd_pl_v2';

/* ══════════════════════════════════════════
   HOA RƠI — Canvas Petal System
══════════════════════════════════════════ */
const canvas = document.getElementById('petal-canvas');
const ctx    = canvas.getContext('2d');

// Các dạng hoa / lá
const PETAL_TYPES = [
  // Cánh hoa tròn
  (c, size, color, alpha) => {
    c.globalAlpha = alpha;
    c.fillStyle = color;
    c.beginPath();
    c.ellipse(0, 0, size * .55, size, 0, 0, Math.PI * 2);
    c.fill();
  },
  // Cánh hoa nhọn
  (c, size, color, alpha) => {
    c.globalAlpha = alpha;
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(0, -size);
    c.bezierCurveTo(size * .7, -size * .5, size * .6, size * .4, 0, size);
    c.bezierCurveTo(-size * .6, size * .4, -size * .7, -size * .5, 0, -size);
    c.fill();
  },
  // Lá nhỏ
  (c, size, color, alpha) => {
    c.globalAlpha = alpha;
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(0, -size);
    c.bezierCurveTo(size * .8, -size * .3, size * .8, size * .3, 0, size);
    c.bezierCurveTo(-size * .8, size * .3, -size * .8, -size * .3, 0, -size);
    c.fill();
    // Gân lá
    c.globalAlpha = alpha * .4;
    c.strokeStyle = darkenColor(color, 30);
    c.lineWidth = .8;
    c.beginPath();
    c.moveTo(0, -size * .8);
    c.lineTo(0, size * .8);
    c.stroke();
  },
  // Hoa 5 cánh
  (c, size, color, alpha) => {
    c.globalAlpha = alpha;
    c.fillStyle = color;
    for (let i = 0; i < 5; i++) {
      c.save();
      c.rotate((i / 5) * Math.PI * 2);
      c.beginPath();
      c.ellipse(0, -size * .6, size * .28, size * .5, 0, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }
    // Nhụy
    c.fillStyle = '#fff8e7';
    c.globalAlpha = alpha * .9;
    c.beginPath();
    c.arc(0, 0, size * .18, 0, Math.PI * 2);
    c.fill();
  },
];

const PETAL_COLORS = [
  '#f9e4e4', '#f7d6d6', '#fce8d5',
  '#eaf4e0', '#d4edc8', '#c8e0b4',
  '#ffffff', '#fef9f0', '#e8f5e0',
];

function darkenColor(hex, amount) {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `rgb(${r},${g},${b})`;
}

class Petal {
  constructor() { this.reset(true); }

  reset(initial = false) {
    this.x     = Math.random() * canvas.width;
    this.y     = initial ? Math.random() * canvas.height * -1 : -20;
    this.size  = 5 + Math.random() * 9;
    this.speedY = .6 + Math.random() * 1.2;
    this.speedX = (Math.random() - .5) * .8;
    this.wobble = Math.random() * Math.PI * 2;
    this.wobbleSpeed = .02 + Math.random() * .03;
    this.rot   = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - .5) * .06;
    this.alpha = .5 + Math.random() * .45;
    this.color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
    this.type  = Math.floor(Math.random() * PETAL_TYPES.length);
    this.swingAmp = 30 + Math.random() * 40;
  }

  update() {
    this.wobble  += this.wobbleSpeed;
    this.x       += this.speedX + Math.sin(this.wobble) * .6;
    this.y       += this.speedY;
    this.rot     += this.rotSpeed;

    if (this.y > canvas.height + 30) this.reset();
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    PETAL_TYPES[this.type](ctx, this.size, this.color, this.alpha);
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}

let petals = [];

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

function initPetals(count = 55) {
  petals = [];
  for (let i = 0; i < count; i++) petals.push(new Petal());
}

function animatePetals() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  petals.forEach(p => { p.update(); p.draw(); });
  petalRAF = requestAnimationFrame(animatePetals);
}

/* ══════════════════════════════════════════
   OPEN INVITATION
══════════════════════════════════════════ */
function openInvitation() {
  const cover = document.getElementById('cover');
  const main  = document.getElementById('main-content');

  cover.classList.add('fade-out');

  setTimeout(() => {
    cover.style.display = 'none';
    main.classList.remove('hidden');

    // Start everything
    startCountdown();
    buildCalendar();
    loadWishes();
    initScrollReveal();
    initMusic();

    // Hoa rơi — canvas z-index 999 (above sections, below gallery)
    resizeCanvas();
    initPetals(60);
    animatePetals();
  }, 900);
}

/* ══════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════ */
function initScrollReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('visible');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* ══════════════════════════════════════════
   COUNTDOWN
══════════════════════════════════════════ */
function startCountdown() {
  updateCountdown();
  cdTimer = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
  const diff = WEDDING_DATE - new Date();
  if (diff <= 0) {
    document.getElementById('countdown').innerHTML =
      '<p style="color:#fff;font-family:var(--f-script);font-size:1.6rem">🎉 Hôm nay là ngày trọng đại!</p>';
    clearInterval(cdTimer);
    return;
  }

  const days    = Math.floor(diff / 864e5);
  const hours   = Math.floor((diff % 864e5) / 36e5);
  const minutes = Math.floor((diff % 36e5) / 6e4);
  const seconds = Math.floor((diff % 6e4) / 1e3);

  setCD('cd-days',    days);
  setCD('cd-hours',   hours);
  setCD('cd-minutes', pad(minutes));
  setCD('cd-seconds', pad(seconds));
}

function setCD(id, val) {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.textContent !== String(val)) {
    el.textContent = val;
    el.classList.remove('tick');
    void el.offsetWidth; // reflow
    el.classList.add('tick');
    setTimeout(() => el.classList.remove('tick'), 200);
  }
}

function pad(n) { return String(n).padStart(2, '0'); }

/* ══════════════════════════════════════════
   CALENDAR — Tháng 11 / 2026
══════════════════════════════════════════ */
function buildCalendar() {
  const grid = document.getElementById('calendar-grid');
  if (!grid) return;

  // Headers Mon–Sun
  ['T2','T3','T4','T5','T6','T7','CN'].forEach(h => {
    const d = document.createElement('div');
    d.className = 'cal-day-header';
    d.textContent = h;
    grid.appendChild(d);
  });

  // 1 Nov 2026 = Sunday → getDay() = 0 → Mon-based offset = 6
  const firstDow = new Date(2026, 10, 1).getDay();   // 0=Sun
  const offset   = firstDow === 0 ? 6 : firstDow - 1;

  for (let i = 0; i < offset; i++) {
    const e = document.createElement('div');
    e.className = 'cal-day empty';
    grid.appendChild(e);
  }

  for (let d = 1; d <= 30; d++) {
    const e = document.createElement('div');
    e.className = 'cal-day' + (d === 28 ? ' wedding-day' : '');
    e.textContent = d;
    grid.appendChild(e);
  }
}

/* ══════════════════════════════════════════
   SCROLL TO RSVP
══════════════════════════════════════════ */
function scrollToRSVP() {
  document.getElementById('guestbook')
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ══════════════════════════════════════════
   GUESTBOOK
══════════════════════════════════════════ */
function loadWishes() { renderWishes(getWishes()); }

function getWishes() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveWishes(w) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(w));
}

function submitWish(e) {
  e.preventDefault();
  const name = document.getElementById('gb-name').value.trim();
  const text = document.getElementById('gb-message').value.trim();
  if (!name || !text) return;

  const wishes = getWishes();
  wishes.unshift({ id: Date.now(), name, text, time: new Date().toLocaleString('vi-VN') });
  saveWishes(wishes);

  document.getElementById('gb-name').value = '';
  document.getElementById('gb-message').value = '';
  renderWishes(wishes);
  document.getElementById('wishes-list')
    .scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderWishes(wishes) {
  const list = document.getElementById('wishes-list');
  if (!list) return;
  if (!wishes.length) {
    list.innerHTML = '<p class="gb-empty">Chưa có lời chúc nào. Hãy là người đầu tiên!</p>';
    return;
  }
  list.innerHTML = wishes.map(w => `
    <div class="wish-item">
      <p class="wish-name">💚 ${esc(w.name)}</p>
      <p class="wish-text">${esc(w.text)}</p>
      <p class="wish-time">${w.time}</p>
    </div>`).join('');
}

function esc(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
          .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

/* ══════════════════════════════════════════
   GALLERY LIGHTBOX
══════════════════════════════════════════ */
function openGallery(startIndex = 0) {
  galleryIndex = startIndex;
  renderGalleryPhoto();
  const ov = document.getElementById('gallery-overlay');
  ov.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  // Pause petals to save CPU behind overlay
  if (petalRAF) { cancelAnimationFrame(petalRAF); petalRAF = null; }
}

function closeGallery() {
  document.getElementById('gallery-overlay').classList.add('hidden');
  document.body.style.overflow = '';
  // Resume petals
  if (!petalRAF) animatePetals();
}

function renderGalleryPhoto() {
  const img = document.getElementById('gallery-img');
  const ctr = document.getElementById('gallery-counter');
  // Animate swap
  img.style.opacity = '0';
  img.style.transform = 'scale(.94)';
  setTimeout(() => {
    img.src = GALLERY_PHOTOS[galleryIndex];
    img.style.transition = 'opacity .25s ease, transform .25s ease';
    img.style.opacity = '1';
    img.style.transform = 'scale(1)';
  }, 120);
  ctr.textContent = `${galleryIndex + 1} / ${GALLERY_PHOTOS.length}`;
}

function prevPhoto() {
  galleryIndex = (galleryIndex - 1 + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length;
  renderGalleryPhoto();
}

function nextPhoto() {
  galleryIndex = (galleryIndex + 1) % GALLERY_PHOTOS.length;
  renderGalleryPhoto();
}

// Touch swipe in gallery
let touchStartX = 0;
document.getElementById('gallery-overlay').addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].clientX;
}, { passive: true });
document.getElementById('gallery-overlay').addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) dx < 0 ? nextPhoto() : prevPhoto();
});

// Keyboard
document.addEventListener('keydown', e => {
  const ov = document.getElementById('gallery-overlay');
  if (!ov.classList.contains('hidden')) {
    if (e.key === 'ArrowLeft')  prevPhoto();
    if (e.key === 'ArrowRight') nextPhoto();
    if (e.key === 'Escape')     closeGallery();
  }
});

/* ══════════════════════════════════════════
   MUSIC — theme_song.mp3
══════════════════════════════════════════ */
function initMusic() {
  audioEl = document.getElementById('bg-music');
  if (!audioEl) return;

  // Bắt đầu ở volume thấp, fade in
  audioEl.volume = 0;

  // Autoplay khi user mở thiệp
  audioEl.play().then(() => {
    musicPlaying = true;
    fadeInMusic();
    updateMusicUI(true);
  }).catch(() => {
    // Autoplay bị block — đợi user click nút nhạc
    musicPlaying = false;
    updateMusicUI(false);
  });
}

function fadeInMusic(targetVol = 0.55, step = 0.02) {
  if (!audioEl) return;
  const tick = setInterval(() => {
    if (audioEl.volume < targetVol - step) {
      audioEl.volume = Math.min(targetVol, audioEl.volume + step);
    } else {
      audioEl.volume = targetVol;
      clearInterval(tick);
    }
  }, 150);
}

function toggleMusic() {
  if (!audioEl) return;
  if (musicPlaying) {
    audioEl.pause();
    musicPlaying = false;
  } else {
    audioEl.play().catch(() => {});
    musicPlaying = true;
    if (audioEl.volume < .1) fadeInMusic();
  }
  updateMusicUI(musicPlaying);
}

function updateMusicUI(playing) {
  const bars = document.getElementById('music-bars');
  if (!bars) return;
  bars.classList.toggle('paused', !playing);
}

/* ══════════════════════════════════════════
   SAVE QR
══════════════════════════════════════════ */
function saveQR(url, filename) {
  const a = document.createElement('a');
  a.href     = url;
  a.download = filename + '.png';
  a.target   = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/* ══════════════════════════════════════════
   RESIZE CANVAS
══════════════════════════════════════════ */
window.addEventListener('resize', () => {
  resizeCanvas();
  // Re-spread petals across new width
  if (petals.length) petals.forEach(p => {
    if (p.x > canvas.width) p.x = Math.random() * canvas.width;
  });
});
