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
   LÁ RƠI — Canvas Leaf System
   Chỉ dùng lá nhỏ màu xanh 2 tone (đậm / nhạt)
   đúng như ảnh template
══════════════════════════════════════════ */
const canvas = document.getElementById('petal-canvas');
const ctx    = canvas.getContext('2d');

// Màu lá: 2 tone xanh đậm & xanh nhạt hơn
const LEAF_COLORS = [
  { fill: '#3d5a3e', vein: '#2a3f2b' },  // xanh rêu đậm
  { fill: '#506e52', vein: '#3d5a3e' },  // xanh rêu vừa
  { fill: '#5a7a5b', vein: '#3d5a3e' },  // xanh rêu nhạt
  { fill: '#3a5c3c', vein: '#243528' },  // tone đậm nhất
];

// Vẽ 1 chiếc lá nhỏ — hình oval nhọn 2 đầu với gân giữa
function drawLeaf(c, size, colorObj, alpha) {
  const { fill, vein } = colorObj;

  c.globalAlpha = alpha;

  // Thân lá
  c.fillStyle = fill;
  c.beginPath();
  c.moveTo(0, -size);
  c.bezierCurveTo(size * 0.55, -size * 0.5, size * 0.55, size * 0.5, 0, size);
  c.bezierCurveTo(-size * 0.55, size * 0.5, -size * 0.55, -size * 0.5, 0, -size);
  c.fill();

  // Gân giữa
  c.globalAlpha = alpha * 0.5;
  c.strokeStyle = vein;
  c.lineWidth = size * 0.12;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(0, -size * 0.8);
  c.lineTo(0, size * 0.8);
  c.stroke();

  // Gân phụ (2 bên nhỏ hơn)
  c.globalAlpha = alpha * 0.25;
  c.lineWidth = size * 0.06;
  [[-0.3, -0.35], [-0.3, 0.1], [-0.25, 0.45]].forEach(([ox, oy]) => {
    c.beginPath();
    c.moveTo(0, oy * size);
    c.lineTo(ox * size * 1.2, (oy - 0.25) * size);
    c.stroke();
    c.beginPath();
    c.moveTo(0, oy * size);
    c.lineTo(-ox * size * 1.2, (oy - 0.25) * size);
    c.stroke();
  });
}

class Leaf {
  constructor() { this.reset(true); }

  reset(initial = false) {
    this.x          = Math.random() * canvas.width;
    this.y          = initial ? Math.random() * -canvas.height : -20;
    this.size       = 5 + Math.random() * 6;           // nhỏ hơn
    this.speedY     = 0.3 + Math.random() * 0.4;       // rơi chậm hơn
    this.speedX     = (Math.random() - 0.5) * 0.25;    // trôi ngang rất nhẹ
    this.wobble     = Math.random() * Math.PI * 2;
    this.wobbleSpd  = 0.01 + Math.random() * 0.015;
    this.wobbleAmp  = 0.25 + Math.random() * 0.35;
    this.rot        = (Math.random() - 0.5) * 0.5;
    this.rotSpd     = (Math.random() - 0.5) * 0.008;   // xoay rất chậm
    this.alpha      = 0.35 + Math.random() * 0.3;      // trong hơn
    this.colorObj   = LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)];
  }

  update() {
    this.wobble += this.wobbleSpd;
    this.x      += this.speedX + Math.sin(this.wobble) * this.wobbleAmp;
    this.y      += this.speedY;
    this.rot    += this.rotSpd;
    if (this.y > canvas.height + 30) this.reset();
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    drawLeaf(ctx, this.size, this.colorObj, this.alpha);
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}

let petals = [];   // giữ tên biến để không phải đổi chỗ khác

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

function initPetals(count = 18) {
  petals = [];
  for (let i = 0; i < count; i++) petals.push(new Leaf());
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
    initPetals(18);
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
   SAVE QR — lưu về thư viện ảnh (mobile)
   hoặc download file (desktop)
══════════════════════════════════════════ */
async function saveQR(src, filename) {
  try {
    // Fetch ảnh về dạng blob
    const resp = await fetch(src);
    const blob = await resp.blob();
    const file = new File([blob], filename + '.png', { type: 'image/png' });

    // Trên mobile: dùng Web Share API → lưu vào thư viện ảnh
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'QR Chuyển khoản – Quốc Du & Phương Ly',
      });
      return;
    }
  } catch (err) {
    // Share bị cancel hoặc không hỗ trợ → fallback download
  }

  // Fallback: tạo link download (desktop / browser không hỗ trợ share)
  const url = URL.createObjectURL(
    await fetch(src).then(r => r.blob())
  );
  const a = document.createElement('a');
  a.href     = url;
  a.download = filename + '.png';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
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
