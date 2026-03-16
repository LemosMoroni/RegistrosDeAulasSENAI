// ══════════════════════════════════════════
//  UTILS — funções auxiliares globais
// ══════════════════════════════════════════

let currentUser    = null;
let currentProfile = null;

// ── Navegação entre abas ──
function showTab(t) {
  ['upload', 'gallery', 'admin'].forEach(v => {
    document.getElementById('view-' + v).classList.toggle('hidden', v !== t);
    document.getElementById('tab-'  + v).classList.toggle('active', v === t);
  });

  if (t === 'gallery') loadProfiles().then(renderGallery);
  if (t === 'admin')   loadProfiles().then(renderAdmin);
}

// ── Datas ──
function today() {
  return new Date().toISOString().split('T')[0];
}

function fmtDate(d) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

// ── Texto ──
function initials(n) {
  return (n || '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
}

function escHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── UI feedback ──
function showMsg(id, type, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = type === 'error' ? 'msg-error' : 'msg-success';
  el.textContent = msg;
  setTimeout(() => { el.textContent = ''; }, 5000);
}

function setLoading(id, on) {
  const el = document.getElementById(id);
  if (!el) return;
  el.disabled = on;
  if (on) {
    el.dataset.orig = el.innerHTML;
    el.innerHTML = '<span class="spinner"></span>';
  } else {
    el.innerHTML = el.dataset.orig || el.innerHTML;
  }
}

function toast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className   = `toast toast-${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}
