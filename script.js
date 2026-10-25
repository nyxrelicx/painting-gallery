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

// Title: split into letters so they can appear one by one
const h1 = document.querySelector('h1');
h1.setAttribute('aria-label', h1.textContent);
h1.innerHTML = [...h1.textContent].map((c, i) => `<span aria-hidden="true" style="--i:${i}">${c}</span>`).join('');

// Floating paintings on the home screen: click one to step inside
document.querySelectorAll('.polaroid img').forEach(img => {
  const n = +img.dataset.n;
  load(img, n);
  img.parentElement.addEventListener('click', e => openTheater(n, e.currentTarget));
});

// ---------- Gallery theater ----------
const theater = $('theater'), stage = $('stage'), card = $('card'), frame = $('frame');
const big = $('big'), cap = $('cap'), count = $('count'), bar = $('progress').firstElementChild;
const END = COUNT + 1;
let cur = 0, token = 0;

// Checks which file ending a painting uses (null if the painting doesn't exist)
function probe(n) {
  return new Promise(res => {
    let i = known[n] ? exts.indexOf(known[n]) : 0;
    const im = new Image();
    im.onload = () => res(im.src);
    im.onerror = () => { if (++i < exts.length) im.src = `images/p${n}.${exts[i]}`; else res(null); };
    im.src = `images/p${n}.${exts[i]}`;
  });
}
const probes = {};
const get = n => probes[n] ||= probe(n);

// Next existing painting in a direction (missing numbers are skipped)
async function neighbor(n, d) {
  for (n += d; n >= 1 && n <= COUNT; n += d) if (await get(n)) return n;
  return null;
}

// Replays an entrance animation
function replay(el) { el.classList.remove('in'); void el.offsetWidth; el.classList.add('in'); }

async function show(n) {
  const t = ++token;
  const src = await get(n);
  if (t !== token) return;
  if (!src) { const m = await neighbor(n, 1); return m ? show(m) : showEnd(); }
  cur = n;
  big.src = src;
  big.alt = cap.textContent = titleOf(n);
  count.textContent = `${String(n).padStart(2, '0')} / ${COUNT}`;
  bar.style.width = (n / COUNT * 100) + '%';
  try { await big.decode(); } catch {}
  if (t !== token) return;
  card.hidden = true;
  frame.hidden = false;
  replay(frame);
  neighbor(n, 1).then(m => m && get(m)); // warm up the next one
}

function showEnd() {
  token++;
  cur = END;
  frame.hidden = true;
  card.hidden = false;
  count.textContent = '';
  bar.style.width = '100%';
  replay(card);
}

async function step(d) {
  if (cur === END) {
    const m = await neighbor(d > 0 ? 0 : END, d > 0 ? 1 : -1);
    if (m) show(m);
    return;
  }
  if (!cur) return;
  const m = await neighbor(cur, d);
  if (m) show(m); else if (d > 0) showEnd();
}

// Opens the theater with a circular reveal that grows out of the clicked painting
function openTheater(n, el) {
  const r = el.getBoundingClientRect();
  theater.style.setProperty('--ox', r.left + r.width / 2 + 'px');
  theater.style.setProperty('--oy', r.top + r.height / 2 + 'px');
  cur = 0;
  frame.hidden = true;
  card.hidden = true;
  theater.showModal();
  show(n);
}

// Click the left third to go back, anywhere else to go forward
stage.addEventListener('click', e => {
  const r = stage.getBoundingClientRect();
  step(e.clientX - r.left < r.width / 3 ? -1 : 1);
});
theater.querySelector('.prev').addEventListener('click', e => { e.stopPropagation(); step(-1); });
theater.querySelector('.next').addEventListener('click', e => { e.stopPropagation(); step(1); });
theater.querySelector('.x').addEventListener('click', e => { e.stopPropagation(); theater.close(); });

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

// ---------- Home screen mood: a light that follows the mouse, depth, embers ----------
if (matchMedia('(pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const root = document.documentElement;
  let last = 0;
  addEventListener('pointermove', e => {
    root.style.setProperty('--mx', e.clientX + 'px');
    root.style.setProperty('--my', e.clientY + 'px');
    root.style.setProperty('--px', (e.clientX / innerWidth - .5) * 2);
    root.style.setProperty('--py', (e.clientY / innerHeight - .5) * 2);
    if (e.timeStamp - last < 60) return;
    last = e.timeStamp;
    const s = document.createElement('span');
    s.className = 'spark';
    s.style.left = e.clientX + 'px';
    s.style.top = e.clientY + 'px';
    document.body.append(s);
    setTimeout(() => s.remove(), 900);
  });
}
