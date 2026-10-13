// Edit titles here: number of the painting -> its title
const titles = {
  // 1: 'Sun Ringing',
  // 2: 'Silly Dog',
};
const COUNT = 27;
const exts = ['png', 'JPG', 'jpg', 'jpeg', 'PNG'];
const known = { 9: 'JPG', 10: 'JPG', 11: 'JPG' };

const titleOf = n => titles[n] || 'Painting ' + n;

// Try each file extension until the image loads
function load(img, n) {
  let i = known[n] ? exts.indexOf(known[n]) : 0;
  img.onerror = () => { if (++i < exts.length) img.src = `images/p${n}.${exts[i]}`; };
  img.src = `images/p${n}.${exts[i]}`;
}

document.querySelectorAll('img[data-n]').forEach(img => load(img, +img.dataset.n));

const track = document.getElementById('track');
const viewer = document.getElementById('viewer');
const big = document.getElementById('big');
const cap = document.getElementById('cap');

for (let n = 1; n <= COUNT; n++) {
  const li = document.createElement('li');
  const btn = document.createElement('button');
  const img = document.createElement('img');
  img.loading = 'lazy';
  img.alt = titleOf(n);
  load(img, n);
  const label = document.createElement('span');
  label.textContent = titleOf(n);
  btn.append(img, label);
  btn.addEventListener('click', () => {
    big.src = img.src; big.alt = img.alt; cap.textContent = titleOf(n);
    viewer.showModal();
  });
  li.append(btn);
  track.append(li);
}

document.getElementById('close').addEventListener('click', () => viewer.close());
viewer.addEventListener('click', e => { if (e.target === viewer) viewer.close(); });
