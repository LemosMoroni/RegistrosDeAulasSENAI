// ══════════════════════════════════════════
//  ADMIN — painel de gestão de usuários
// ══════════════════════════════════════════

async function renderAdmin() {
  const { data: records } = await db.from('records').select('id, teacher_id, image_url, date');
  const todayStr = today();

  // Estatísticas
  document.getElementById('stats-row').innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Total de registros</div>
      <div class="stat-value">${(records || []).length}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Professores</div>
      <div class="stat-value">${allProfiles.filter(p => p.role === 'teacher').length}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Registros hoje</div>
      <div class="stat-value">${(records || []).filter(r => r.date === todayStr).length}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Com fotos</div>
      <div class="stat-value">${(records || []).filter(r => r.image_url).length}</div>
    </div>`;

  // Lista de usuários
  const recCount = id => (records || []).filter(r => r.teacher_id === id).length;

  document.getElementById('teachers-list').innerHTML = allProfiles.map(u => `
    <div class="teacher-row">
      <div class="teacher-info">
        <div class="avatar">${initials(u.name)}</div>
        <div>
          <div class="teacher-name">${escHtml(u.name)}</div>
          <div class="teacher-email">${escHtml(u.email)}</div>
        </div>
        <span class="badge badge-${u.role}">${u.role === 'admin' ? 'Admin' : 'Professor'}</span>
      </div>
      <div class="teacher-actions">
        <span class="records-count">${recCount(u.id)} registro${recCount(u.id) !== 1 ? 's' : ''}</span>
        ${u.id !== currentUser.id
          ? `<button class="btn btn-danger btn-sm" onclick="removeUser('${u.id}','${escHtml(u.name)}')">Remover</button>`
          : `<span style="font-size:12px;color:var(--muted)">(você)</span>`
        }
      </div>
    </div>`
  ).join('');
}

async function addTeacher() {
  const name  = document.getElementById('new-name').value.trim();
  const email = document.getElementById('new-email').value.trim();
  const pass  = document.getElementById('new-pass').value;
  const role  = document.getElementById('new-role').value;

  if (!name || !email || !pass) { showMsg('add-msg', 'error', 'Preencha todos os campos.'); return; }
  if (pass.length < 6)          { showMsg('add-msg', 'error', 'Senha mínima de 6 caracteres.'); return; }

  setLoading('btn-add', true);

  const { data, error } = await db.auth.signUp({
    email, password: pass, options: { data: { name } }
  });

  if (error) { showMsg('add-msg', 'error', error.message); setLoading('btn-add', false); return; }

  if (data.user) {
    await db.from('profiles').upsert({ id: data.user.id, name, email, role });
  }

  setLoading('btn-add', false);
  showMsg('add-msg', 'success', `${name} adicionado com sucesso!`);

  document.getElementById('new-name').value = '';
  document.getElementById('new-email').value = '';
  document.getElementById('new-pass').value  = '';

  await loadProfiles();
  renderAdmin();
}

async function removeUser(id, name) {
  if (!confirm(`Remover ${name}? Todos os registros deste professor também serão excluídos.`)) return;

  await db.from('records').delete().eq('teacher_id', id);
  await db.from('profiles').delete().eq('id', id);

  toast(`${name} removido.`, 'success');
  await loadProfiles();
  renderAdmin();
}
