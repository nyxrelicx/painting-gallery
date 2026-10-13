// Give your paintings names here. Remove the // and type a title:
const titles = {
  // 1: 'My first painting',
  // 2: 'Sleepy cat',
};
const COUNT = 27;

const exts = ['png', 'JPG', 'jpg', 'jpeg', 'PNG'];
const known = { 9: 'JPG', 10: 'JPG', 11: 'JPG' };
const titleOf = n => titles[n] || 'Painting ' + n;

// Tries each file ending until the picture loads
function load(img, n) {
  let i = known[n] ? exts.indexOf(known[n]) : 0;
  img.onerror = () => { if (++i < exts.length) img.src = `images/p${n}.${exts[i]}`; };
  img.src = `images/p${n}.${exts[i]}`;
}

// Big painting viewer
const viewer = document.getElementById('viewer');
function openBig(img, n) {
  document.getElementById('big').src = img.src;
  document.getElementById('big').alt = titleOf(n);
  document.getElementById('cap').textContent = titleOf(n);
  viewer.showModal();
}

// Floating paintings on the home screen
document.querySelectorAll('.polaroid img').forEach(img => {
  const n = +img.dataset.n;
  load(img, n);
  img.parentElement.addEventListener('click', () => openBig(img, n));
});

// Gallery grid
const grid = document.getElementById('grid');
for (let n = 1; n <= COUNT; n++) {
  const li = document.createElement('li');
  li.style.setProperty('--i', n);
  const btn = document.createElement('button');
  const img = document.createElement('img');
  img.loading = 'lazy';
  img.alt = titleOf(n);
  load(img, n);
  btn.append(img);
  btn.addEventListener('click', () => openBig(img, n));
  li.append(btn);
  grid.append(li);
}

// Open and close popups
document.querySelectorAll('[data-open]').forEach(b =>
  b.addEventListener('click', () => document.getElementById(b.dataset.open).showModal()));
document.querySelectorAll('dialog').forEach(d => {
  d.querySelector('.x').addEventListener('click', () => d.close());
  d.addEventListener('click', e => { if (e.target === d) d.close(); });
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
