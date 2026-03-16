// ══════════════════════════════════════════
//  PDF — geração de relatório por professor
// ══════════════════════════════════════════

function showPdfModal() {
  const sel = document.getElementById('pdf-teacher');
  sel.innerHTML = '<option value="">Todos os professores</option>';

  if (currentProfile.role === 'teacher') {
    sel.innerHTML = `<option value="${currentProfile.id}" selected>${currentProfile.name}</option>`;
    sel.disabled  = true;
  } else {
    allProfiles.forEach(p => {
      sel.innerHTML += `<option value="${p.id}">${p.name}</option>`;
    });
  }

  document.getElementById('pdf-modal').classList.remove('hidden');
}

function closePdfModal() {
  document.getElementById('pdf-modal').classList.add('hidden');
}

async function generatePDF() {
  const teacherId = document.getElementById('pdf-teacher').value ||
                    (currentProfile.role === 'teacher' ? currentProfile.id : '');
  const from = document.getElementById('pdf-from').value;
  const to   = document.getElementById('pdf-to').value;

  setLoading('btn-pdf', true);

  let query = db.from('records').select('*').order('date', { ascending: true });
  if (teacherId) query = query.eq('teacher_id', teacherId);
  if (from)      query = query.gte('date', from);
  if (to)        query = query.lte('date', to);

  const { data: records } = await query;
  setLoading('btn-pdf', false);

  if (!records || !records.length) {
    toast('Nenhum registro para os filtros selecionados.', 'error');
    return;
  }

  const { jsPDF }      = window.jspdf;
  const doc            = new jsPDF('p', 'mm', 'a4');
  const teacherName    = teacherId
    ? (allProfiles.find(p => p.id === teacherId) || { name: 'Todos' }).name
    : 'Todos os professores';

  // Cabeçalho
  doc.setFillColor(21, 101, 168);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22); doc.setFont('helvetica', 'bold');
  doc.text('RegistroAula', 14, 18);
  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  doc.text('Relatório de Registros Fotográficos de Aulas', 14, 25);

  // Metadados
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.text(`Professor: ${teacherName}`, 14, 42);

  const periodo = from && to
    ? `${fmtDate(from)} a ${fmtDate(to)}`
    : from ? `a partir de ${fmtDate(from)}`
    : to   ? `até ${fmtDate(to)}`
    :        'Todos os períodos';

  doc.text(`Período: ${periodo}`, 14, 48);
  doc.text(`Total de registros: ${records.length}`, 14, 54);
  doc.text(
    `Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
    14, 60
  );
  doc.setDrawColor(220, 220, 220);
  doc.line(14, 65, 196, 65);

  let y = 72;

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    if (y > 255) { doc.addPage(); y = 20; }

    // Título
    doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.setTextColor(21, 101, 168);
    doc.text(`${i + 1}. ${r.title}`, 14, y); y += 6;

    // Data e professor
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(130, 130, 130);
    const pname = (allProfiles.find(p => p.id === r.teacher_id) || { name: r.teacher_name || '?' }).name;
    doc.text(`${fmtDate(r.date)}  —  ${pname}`, 14, y); y += 5;

    // Descrição
    if (r.description) {
      doc.setTextColor(60, 60, 60); doc.setFontSize(10);
      const lines = doc.splitTextToSize(r.description, 172);
      doc.text(lines, 14, y);
      y += lines.length * 5 + 2;
    }

    // Fotos (até 3, exibidas lado a lado)
    const photoUrls = [r.image_url, r.image_url_2, r.image_url_3].filter(Boolean);
    if (photoUrls.length > 0) {
      try {
        const imgDataArr = await Promise.all(photoUrls.map(fetchImageAsBase64));
        const validImgs  = imgDataArr.filter(Boolean);
        if (validImgs.length > 0) {
          const gap    = 4;
          const totalW = 182;
          const imgW   = (totalW - gap * (validImgs.length - 1)) / validImgs.length;
          const imgH   = 50;
          if (y + imgH > 270) { doc.addPage(); y = 20; }
          validImgs.forEach((imgData, idx) => {
            const props = doc.getImageProperties(imgData);
            let w = imgW, h = imgW * (props.height / props.width);
            if (h > imgH) { h = imgH; w = imgH * (props.width / props.height); }
            const x = 14 + idx * (imgW + gap);
            doc.addImage(imgData, props.fileType || 'JPEG', x, y, w, h);
          });
          y += imgH + 4;
        }
      } catch (e) { /* ignora erros de imagem individual */ }
    }

    doc.setDrawColor(230, 230, 230);
    doc.line(14, y + 2, 196, y + 2);
    y += 10;
  }

  // Numeração de páginas
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFontSize(9); doc.setTextColor(160);
    doc.text(`Página ${p} de ${pages}`, 196, 290, { align: 'right' });
  }

  doc.save(`registroaula-${teacherName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`);
  closePdfModal();
  toast('PDF gerado com sucesso!', 'success');
}

async function fetchImageAsBase64(url) {
  const res  = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
