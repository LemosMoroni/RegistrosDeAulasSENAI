// ══════════════════════════════════════════
//  GALLERY — listagem e filtros de registros
// ══════════════════════════════════════════

let allProfiles = [];
let allRecords  = [];

async function loadProfiles() {
  const { data } = await db.from('profiles').select('*').order('name');
  allProfiles = data || [];
}

async function renderGallery() {
  const search   = document.getElementById('f-search').value.toLowerCase();
  const dateF    = document.getElementById('f-date-filter').value;
  const teacherF = document.getElementById('f-teacher').value;

  // Popula filtro de professores
  const sel  = document.getElementById('f-teacher');
  const prev = sel.value;
  sel.innerHTML = '<option value="">Todos os professores</option>';
  allProfiles.forEach(p => {
    sel.innerHTML += `<option value="${p.id}" ${p.id === prev ? 'selected' : ''}>${p.name}</option>`;
  });

  if (currentProfile.role === 'teacher') {
    sel.value    = currentProfile.id;
    sel.disabled = true;
  }

  // Monta query com filtros do servidor
  let query = db.from('records')
    .select('*')
    .order('date',       { ascending: false })
    .order('created_at', { ascending: false });

  if (currentProfile.role === 'teacher') query = query.eq('teacher_id', currentProfile.id);
  else if (teacherF)                     query = query.eq('teacher_id', teacherF);
  if (dateF)                             query = query.eq('date', dateF);

  const { data, error } = await query;
  if (error) { toast('Erro ao carregar registros: ' + error.message, 'error'); return; }

  allRecords = data || [];

  // Filtro de busca local
  let records = allRecords;
  if (search) {
    records = records.filter(r =>
      r.title.toLowerCase().includes(search) ||
      (r.description || '').toLowerCase().includes(search)
    );
  }

  renderGalleryGrid(records);
}

function renderGalleryGrid(records) {
  const grid = document.getElementById('gallery-grid');

  if (!records.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🖼️</span>
        <div>Nenhum registro encontrado</div>
      </div>`;
    return;
  }

  grid.innerHTML = records.map(r => {
    // Coleta todas as fotos disponíveis do registro
    const photos = [r.image_url, r.image_url_2, r.image_url_3].filter(Boolean);
    const hasPhotos = photos.length > 0;

    const photoArea = hasPhotos
      ? `<div class="card-photos count-${photos.length}">
           ${photos.map((url, i) => `
             <img class="card-photo" src="${escHtml(url)}"
                  alt="Foto ${i + 1}" loading="lazy">`
           ).join('')}
         </div>`
      : `<div class="photo-card-nophoto">📷</div>`;

    const photoBadge = photos.length > 1
      ? `<span class="photos-badge">${photos.length} fotos</span>`
      : '';

    return `
      <div class="photo-card">
        ${photoArea}
        <div class="photo-info">
          <div class="photo-title-row">
            <div class="photo-title">${escHtml(r.title)}</div>
            ${photoBadge}
          </div>
          <div class="photo-desc">${escHtml(r.description || 'Sem descrição')}</div>
          <div class="photo-meta">
            <span class="meta-date">${fmtDate(r.date)}</span>
            <span class="meta-teacher">${escHtml((r.teacher_name || '?').split(' ')[0])}</span>
          </div>
        </div>
      </div>`;
  }).join('');
}
