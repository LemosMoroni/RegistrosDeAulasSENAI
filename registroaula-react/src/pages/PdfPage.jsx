import { useState, useEffect } from 'react'
import { db } from '../lib/supabase'
import { jsPDF } from 'jspdf'

async function toBase64(url) {
  try {
    const res  = await fetch(url)
    const blob = await res.blob()
    const type = blob.type || 'image/jpeg'
    return new Promise((resolve, reject) => {
      const r = new FileReader()
      r.onload  = () => resolve({ data: r.result, type })
      r.onerror = reject
      r.readAsDataURL(blob)
    })
  } catch { return null }
}

export default function PdfPage({ profile }) {
  const [profiles, setProfiles]     = useState([])
  const [teacherF, setTeacherF]     = useState('')
  const [from, setFrom]             = useState('')
  const [to, setTo]                 = useState('')
  const [generating, setGenerating] = useState(false)
  const [msg, setMsg]               = useState(null)

  useEffect(() => {
    db.from('profiles').select('*').order('name')
      .then(({ data }) => setProfiles(data || []))
  }, [])

  async function generate() {
    setGenerating(true); setMsg(null)

    const tid = profile?.role === 'teacher' ? profile.id : teacherF

    let query = db.from('records').select('*').order('date', { ascending: true })
    if (tid)  query = query.eq('teacher_id', tid)
    if (from) query = query.gte('date', from)
    if (to)   query = query.lte('date', to)

    const { data: records } = await query
    if (!records?.length) {
      setMsg({ type: 'error', text: 'Nenhum registro encontrado para os filtros selecionados.' })
      setGenerating(false); return
    }

    const teacherName = tid
      ? (profiles.find(p => p.id === tid)?.name || 'Professor')
      : 'Todos os professores'

    const doc = new jsPDF('p', 'mm', 'a4')

    // Cabeçalho
    doc.setFillColor(21, 101, 168)
    doc.rect(0, 0, 210, 30, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20); doc.setFont('helvetica', 'bold')
    doc.text('RegistroAula — SENAI', 14, 18)
    doc.setFontSize(9); doc.setFont('helvetica', 'normal')
    doc.text('Relatório de Registros Fotográficos de Aulas', 14, 25)

    // Metadados
    doc.setTextColor(60, 60, 60); doc.setFontSize(10)
    doc.text(`Professor: ${teacherName}`, 14, 42)
    const periodo = from && to
      ? `${from.split('-').reverse().join('/')} a ${to.split('-').reverse().join('/')}`
      : from ? `A partir de ${from.split('-').reverse().join('/')}`
      : to   ? `Até ${to.split('-').reverse().join('/')}`
      : 'Todos os períodos'
    doc.text(`Período: ${periodo}`, 14, 49)
    doc.text(`Total de registros: ${records.length}`, 14, 56)
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 63)
    doc.setDrawColor(200, 200, 200); doc.line(14, 68, 196, 68)

    let y = 75

    for (let i = 0; i < records.length; i++) {
      const r = records[i]
      if (y > 255) { doc.addPage(); y = 20 }

      // Título
      doc.setFontSize(12); doc.setFont('helvetica', 'bold')
      doc.setTextColor(21, 101, 168)
      doc.text(`${i + 1}. ${r.title}`, 14, y); y += 6

      // Data e professor
      doc.setFontSize(9); doc.setFont('helvetica', 'normal')
      doc.setTextColor(130, 130, 130)
      const pname = profiles.find(p => p.id === r.teacher_id)?.name || r.teacher_name || '?'
      doc.text(`${r.date?.split('-').reverse().join('/')}  —  ${pname}`, 14, y); y += 5

      // Descrição
      if (r.description) {
        doc.setTextColor(60, 60, 60); doc.setFontSize(10)
        const lines = doc.splitTextToSize(r.description, 172)
        doc.text(lines, 14, y); y += lines.length * 5 + 2
      }

      // Fotos lado a lado (até 3)
      const photos = [r.image_url, r.image_url_2, r.image_url_3].filter(Boolean)
      if (photos.length > 0) {
        const imgs = (await Promise.all(photos.map(toBase64))).filter(Boolean)
        if (imgs.length > 0) {
          const gap = 4, totalW = 182
          const imgW = (totalW - gap * (imgs.length - 1)) / imgs.length
          const imgH = imgs.length === 1 ? 120 : 80
          if (y + imgH > 270) { doc.addPage(); y = 20 }
          imgs.forEach(({ data, type }, idx) => {
            try {
              const ext = type.split('/')[1]?.toUpperCase() || 'JPEG'
              const format = ext === 'JPG' ? 'JPEG' : ext
              const props = doc.getImageProperties(data)
              let w = imgW, h = imgW * (props.height / props.width)
              if (h > imgH) { h = imgH; w = imgH * (props.width / props.height) }
              const x = 14 + idx * (imgW + gap)
              doc.addImage(data, format, x, y, w, h)
            } catch(e) { console.warn('Imagem ignorada:', e) }
          })
          y += imgH + 4
        }
      }

      doc.setDrawColor(230, 230, 230); doc.line(14, y + 2, 196, y + 2); y += 10
    }

    // Numeração de páginas
    const pages = doc.getNumberOfPages()
    for (let p = 1; p <= pages; p++) {
      doc.setPage(p); doc.setFontSize(9); doc.setTextColor(160)
      doc.text(`Página ${p} de ${pages}`, 196, 290, { align: 'right' })
    }

    doc.save(`registroaula-${teacherName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`)
    setMsg({ type: 'success', text: `PDF gerado com ${records.length} registro${records.length !== 1 ? 's' : ''}!` })
    setGenerating(false)
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-senai-600 text-xl font-semibold mb-6">Gerar relatório PDF</h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">

        {msg && (
          <div className={`p-3 border-l-4 text-sm rounded-r-lg ${
            msg.type === 'error'
              ? 'bg-red-50 border-red-500 text-red-700'
              : 'bg-senai-50 border-senai-600 text-senai-900'
          }`}>{msg.text}</div>
        )}

        {profile?.role === 'admin' && (
          <div>
            <label className="block text-xs font-semibold text-senai-600 uppercase tracking-wide mb-1">Professor</label>
            <select value={teacherF} onChange={e => setTeacherF(e.target.value)}
              className="w-full border-2 border-senai-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-senai-600 transition-colors text-senai-600">
              <option value="">Todos os professores</option>
              {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-senai-600 uppercase tracking-wide mb-1">Data inicial</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)}
              className="w-full border-2 border-senai-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-senai-600 transition-colors text-senai-600" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-senai-600 uppercase tracking-wide mb-1">Data final</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)}
              className="w-full border-2 border-senai-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-senai-600 transition-colors text-senai-600" />
          </div>
        </div>

        <div className="bg-senai-50 rounded-xl p-4 text-xs text-senai-600 space-y-1 border border-senai-100">
          <p className="font-semibold">O relatório incluirá:</p>
          <p>· Título, data e professor de cada aula</p>
          <p>· Descrição completa</p>
          <p>· Fotos lado a lado (até 3 por registro)</p>
          <p>· Numeração de páginas</p>
        </div>

        <button onClick={generate} disabled={generating}
          className="w-full bg-senai-600 hover:bg-senai-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          {generating
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Gerando PDF...</>
            : 'Gerar e baixar PDF'
          }
        </button>

      </div>
    </div>
  )
}