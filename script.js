// Give your paintings names here. Remove the // and type a title:
const titles = {
  // 1: 'My first painting',
  // 2: 'Sleepy cat',
};
const COUNT = 27;

const exts = ['png', 'JPG', 'jpg', 'jpeg', 'PNG'];
const known = { 9: 'JPG', 10: 'JPG', 11: 'JPG' };
const titleOf = n => titles[n] || 'Painting ' + n;
const $ = id => document.getElementById(id);

// Tries each file ending until the picture loads
function load(img, n) {
  let i = known[n] ? exts.indexOf(known[n]) : 0;
  img.onerror = () => { if (++i < exts.length) img.src = `images/p${n}.${exts[i]}`; };
  img.src = `images/p${n}.${exts[i]}`;
}

// Floating paintings on the home screen (click one to start the show there)
document.querySelectorAll('.polaroid img').forEach(img => {
  const n = +img.dataset.n;
  load(img, n);
  img.parentElement.addEventListener('click', () => openTheater(n));
});

// ---------- Gallery theater ----------
const theater = $('theater'), stage = $('stage'), card = $('card'), frame = $('frame');
const big = $('big'), cap = $('cap'), count = $('count');
const srcs = {};      // painting number -> working image url
let list = [];        // painting numbers that actually exist
let pos = -1;         // -1 = intro card, list.length = end card
let ready = null;

// Find which paintings exist (missing numbers are skipped automatically)
function probe(n) {
  return new Promise(res => {
    let i = known[n] ? exts.indexOf(known[n]) : 0;
    const im = new Image();
    im.onload = () => res(im.src);
    im.onerror = () => { if (++i < exts.length) im.src = `images/p${n}.${exts[i]}`; else res(null); };
    im.src = `images/p${n}.${exts[i]}`;
  });
}
function prepare() {
  return ready ||= Promise.all(Array.from({ length: COUNT }, (_, k) => probe(k + 1))).then(r =>
    r.forEach((s, k) => { if (s) { srcs[k + 1] = s; list.push(k + 1); } }));
}

// Replays the entrance animation
function replay(el) { el.classList.remove('in'); void el.offsetWidth; el.classList.add('in'); }

function showCard(end) {
  frame.hidden = true;
  card.hidden = false;
  card.querySelector('h2').innerHTML = end ? 'the end &#9825;' : 'gallery &#10024;';
  card.querySelector('p').textContent = end ? 'click to watch again' : 'click to begin';
  count.textContent = '';
  pos = end ? list.length : -1;
  replay(card);
}

async function show(i) {
  pos = i;
  const n = list[i];
  card.hidden = true;
  frame.hidden = false;
  big.src = srcs[n];
  big.alt = cap.textContent = titleOf(n);
  count.textContent = `${i + 1} / ${list.length}`;
  try { await big.decode(); } catch {}
  replay(frame);
  // warm up the next painting so the reveal is instant
  if (list[i + 1]) new Image().src = srcs[list[i + 1]];
}

async function step(d) {
  await ready;
  if (!list.length) return;
  if (pos < 0) return d > 0 ? show(0) : undefined;
  if (pos >= list.length) return d > 0 ? show(0) : show(list.length - 1);
  const t = pos + d;
  if (t < 0) showCard(false);
  else if (t >= list.length) showCard(true);
  else show(t);
}

async function openTheater(startN) {
  theater.showModal();
  showCard(false);
  ready = null;
  await prepare();
  if (startN) { const i = list.indexOf(startN); show(i < 0 ? 0 : i); }
}

$('openGallery').addEventListener('click', () => openTheater());

// Click the left third to go back, anywhere else to go forward
stage.addEventListener('click', e => {
  const r = stage.getBoundingClientRect();
  step(e.clientX - r.left < r.width / 3 ? -1 : 1);
});
theater.querySelector('.prev').addEventListener('click', e => { e.stopPropagation(); step(-1); });
theater.querySelector('.next').addEventListener('click', e => { e.stopPropagation(); step(1); });

// Keyboard and swipe
theater.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') step(1);
  if (e.key === 'ArrowLeft') step(-1);
});
let sx = null;
stage.addEventListener('pointerdown', e => { sx = e.clientX; });
stage.addEventListener('pointerup', e => {
  if (sx !== null && Math.abs(e.clientX - sx) > 50) {
    stage.dataset.swiped = '1';
    step(e.clientX < sx ? 1 : -1);
  }
  sx = null;
});
// a swipe also fires a click; swallow that one
stage.addEventListener('click', e => {
  if (stage.dataset.swiped) { e.stopImmediatePropagation(); delete stage.dataset.swiped; }
}, true);

// Open and close popups
document.querySelectorAll('[data-open]').forEach(b =>
  b.addEventListener('click', () => document.getElementById(b.dataset.open).showModal()));
document.querySelectorAll('dialog').forEach(d => {
  d.querySelector('.x').addEventListener('click', e => { e.stopPropagation(); d.close(); });
  if (d.classList.contains('popup')) d.addEventListener('click', e => { if (e.target === d) d.close(); });
});

// Sparkles that follow the mouse
if (!matchMedia('(prefers-reduced-motion: reduce)').matches && matchMedia('(pointer: fine)').matches) {
  let last = 0;
  addEventListener('pointermove', e => {
    if (e.timeStamp - last < 70) return;
    last = e.timeStamp;
    const s = document.createElement('span');
    s.className = 'spark';
    s.textContent = ['✦', '✧', '♡'][Math.floor(Math.random() * 3)];
    s.style.left = e.clientX + 'px';
    s.style.top = e.clientY + 'px';
    document.body.append(s);
    setTimeout(() => s.remove(), 800);
  });
}
