// ══════════════════════════════════════════
//  AUTH — login, registro, logout, sessão
// ══════════════════════════════════════════

async function init() {
  // Supabase v2 dispara INITIAL_SESSION imediatamente ao registrar o listener,
  // então não precisamos chamar getSession() separadamente (evita duplo loadApp).
  db.auth.onAuthStateChange(async (_event, sess) => {
    if (window._suppressAuthChange) return;
    if (sess) await loadApp(sess.user);
    else showAuthScreen();
  });
}

function showAuthScreen() {
  currentUser    = null;
  currentProfile = null;

  // Reseta estado visual completamente ao deslogar
  document.getElementById('tab-admin').classList.add('hidden');
  document.getElementById('app-screen').classList.add('hidden');
  document.getElementById('auth-screen').classList.remove('hidden');

  // Volta para a aba de login limpa
  showView('login');
  document.getElementById('login-email').value = '';
  document.getElementById('login-pass').value  = '';
  document.getElementById('login-msg').textContent = '';
}

function showView(v) {
  ['login', 'register'].forEach(x =>
    document.getElementById('view-' + x).classList.toggle('hidden', x !== v)
  );
}

async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  if (!email || !pass) { showMsg('login-msg', 'error', 'Preencha e-mail e senha.'); return; }

  setLoading('btn-login', true);
  const { error } = await db.auth.signInWithPassword({ email, password: pass });
  setLoading('btn-login', false);

  if (error) {
    showMsg('login-msg', 'error',
      error.message === 'Invalid login credentials'
        ? 'E-mail ou senha incorretos.'
        : error.message
    );
  }
}

async function doRegister() {
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass  = document.getElementById('reg-pass').value;

  if (!name || !email || !pass) { showMsg('reg-msg', 'error', 'Preencha todos os campos.'); return; }
  if (pass.length < 6)          { showMsg('reg-msg', 'error', 'Senha deve ter pelo menos 6 caracteres.'); return; }

  setLoading('btn-reg', true);
  const { data, error } = await db.auth.signUp({
    email, password: pass, options: { data: { name } }
  });

  if (error) { showMsg('reg-msg', 'error', error.message); setLoading('btn-reg', false); return; }

  if (data.user) {
    await db.from('profiles').upsert({ id: data.user.id, name, email, role: 'teacher' });
  }

  setLoading('btn-reg', false);
  showMsg('reg-msg', 'success', 'Conta criada! Faça login para continuar.');
  setTimeout(() => showView('login'), 2000);
}

async function doLogout() {
  await db.auth.signOut();
  // showAuthScreen() é chamado automaticamente pelo onAuthStateChange
}

async function loadApp(user) {
  currentUser = user;

  const { data: prof } = await db.from('profiles').select('*').eq('id', user.id).single();

  if (!prof) {
    const name = user.user_metadata?.name || user.email.split('@')[0];
    await db.from('profiles').upsert({ id: user.id, name, email: user.email, role: 'teacher' });
    currentProfile = { id: user.id, name, email: user.email, role: 'teacher' };
  } else {
    currentProfile = prof;
  }

  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('app-screen').classList.remove('hidden');

  // Atualiza nome do usuário
  const shortName = currentProfile.name.split(' ')[0];
  document.getElementById('user-pill').textContent =
    shortName + (currentProfile.role === 'admin' ? ' (Admin)' : '');

  // Sempre reseta a aba admin antes de decidir se mostra
  document.getElementById('tab-admin').classList.add('hidden');
  if (currentProfile.role === 'admin')
    document.getElementById('tab-admin').classList.remove('hidden');

  // Garante que começa sempre na aba de upload
  document.getElementById('f-date').value = today();
  showTab('upload');
}