// ══════════════════════════════════════════
//  UPLOAD — seleção e envio de até 3 fotos
// ══════════════════════════════════════════

const MAX_PHOTOS = 3;
const MAX_SIZE   = 5 * 1024 * 1024; // 5 MB por foto

let selectedFiles = []; // array de File objects (máx 3)

// ── Renderiza os slots de foto ──
function renderPhotoSlots() {
  const container = document.getElementById('photo-slots');
  container.innerHTML = '';

  for (let i = 0; i < MAX_PHOTOS; i++) {
    const file    = selectedFiles[i];
    const slotNum = i + 1;
    const isFirst = i === 0;

    const slot = document.createElement('div');
    slot.className = 'photo-slot' + (file ? ' has-img' : '') + (isFirst ? ' slot-primary' : '');
    slot.dataset.index = i;

    if (file) {
      // Slot com foto selecionada
      const url = URL.createObjectURL(file);
      slot.innerHTML = `
        <img src="${url}" alt="Foto ${slotNum}" class="slot-img">
        <div class="slot-overlay">
          <button class="slot-btn-change" onclick="triggerSlotInput(${i})">Trocar</button>
          <button class="slot-btn-remove" onclick="removePhoto(${i})">Remover</button>
        </div>
        <div class="slot-badge">${slotNum}</div>`;
    } else if (i <= selectedFiles.length) {
      // Slot disponível para adicionar
      slot.innerHTML = `
        <div class="slot-empty" onclick="triggerSlotInput(${i})">
          <span class="slot-icon">＋</span>
          <span class="slot-label">${isFirst ? 'Adicionar foto' : 'Foto ' + slotNum}</span>
          <span class="slot-sub">JPG, PNG ou WEBP · máx. 5 MB</span>
        </div>`;
    } else {
      // Slot bloqueado (não pode pular)
      slot.innerHTML = `
        <div class="slot-empty slot-locked">
          <span class="slot-icon" style="opacity:.3">📷</span>
          <span class="slot-label" style="opacity:.4">Foto ${slotNum}</span>
        </div>`;
    }

    container.appendChild(slot);
  }

  // Atualiza contador
  document.getElementById('photo-count').textContent =
    selectedFiles.length
      ? `${selectedFiles.length} de ${MAX_PHOTOS} foto${selectedFiles.length > 1 ? 's' : ''} selecionada${selectedFiles.length > 1 ? 's' : ''}`
      : 'Nenhuma foto selecionada';
}

function triggerSlotInput(index) {
  const inp = document.getElementById('file-inp');
  inp.dataset.slotIndex = index;
  inp.value = '';
  inp.click();
}

function handleFile(e) {
  const file  = e.target.files[0];
  const index = parseInt(e.target.dataset.slotIndex ?? 0);
  if (!file) return;

  if (file.size > MAX_SIZE) {
    toast(`Foto ${index + 1} muito grande. Máximo 5 MB por foto.`, 'error');
    return;
  }

  selectedFiles[index] = file;
  // Remove buracos no array
  selectedFiles = selectedFiles.filter(Boolean);
  renderPhotoSlots();
}

function removePhoto(index) {
  selectedFiles.splice(index, 1);
  renderPhotoSlots();
}

// ── Salva o registro com até 3 fotos ──
async function saveRecord() {
  const title = document.getElementById('f-title').value.trim();
  const date  = document.getElementById('f-date').value;
  const desc  = document.getElementById('f-desc').value.trim();

  if (!title || !date) {
    toast('Preencha pelo menos o título e a data.', 'error');
    return;
  }

  setLoading('btn-save', true);

  // Faz upload de cada foto e coleta as URLs
  const imageUrls = [];
  for (let i = 0; i < selectedFiles.length; i++) {
    const file = selectedFiles[i];
    const ext  = file.name.split('.').pop();
    const path = `${currentUser.id}/${Date.now()}-${i}.${ext}`;

    const { error: upErr } = await db.storage
      .from('aulas')
      .upload(path, file, { upsert: true });

    if (upErr) {
      toast(`Erro ao enviar foto ${i + 1}: ${upErr.message}`, 'error');
      setLoading('btn-save', false);
      return;
    }

    const { data: urlData } = db.storage.from('aulas').getPublicUrl(path);
    imageUrls.push(urlData.publicUrl);
  }

  const { error } = await db.from('records').insert({
    teacher_id:   currentUser.id,
    teacher_name: currentProfile.name,
    title,
    description:  desc,
    date,
    image_url:    imageUrls[0] || null,
    image_url_2:  imageUrls[1] || null,
    image_url_3:  imageUrls[2] || null,
  });

  setLoading('btn-save', false);

  if (error) {
    toast('Erro ao salvar registro: ' + error.message, 'error');
    return;
  }

  toast(`Aula registrada com ${imageUrls.length || 'nenhuma'} foto${imageUrls.length !== 1 ? 's' : ''}!`, 'success');
  resetUploadForm();
}

function resetUploadForm() {
  document.getElementById('f-title').value = '';
  document.getElementById('f-desc').value  = '';
  document.getElementById('f-date').value  = today();
  document.getElementById('file-inp').value = '';
  selectedFiles = [];
  renderPhotoSlots();
}
