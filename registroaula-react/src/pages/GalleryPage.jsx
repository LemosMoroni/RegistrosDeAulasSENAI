import { useState, useEffect } from 'react'
import { db } from '../lib/supabase'
import ConfirmModal from '../components/ConfirmModal'
import { toast } from '../components/Toast'

const PER_PAGE = 12

// ── Download de fotos ────────────────────────────────────────
async function downloadPhotos(photos, title) {
  for (let i = 0; i < photos.length; i++) {
    try {
      const res  = await fetch(photos[i])
      const blob = await res.blob()
      const ext  = blob.type.split('/')[1] || 'jpg'
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `${title.replace(/\s+/g, '-').toLowerCase()}-foto${i + 1}.${ext}`
      a.click()
      URL.revokeObjectURL(url)
      await new Promise(r => setTimeout(r, 400))
    } catch (e) { console.warn(`Erro ao baixar foto ${i + 1}:`, e) }
  }
}

// ── Imagem com fallback ──────────────────────────────────────
function SafeImg({ src, className }) {
  const [error, setError] = useState(false)
  if (error) return (
    <div className={`${className} bg-senai-50 flex flex-col items-center justify-center gap-1`}>
      <span className="text-2xl">🖼️</span>
      <span className="text-xs text-senai-400 font-semibold">Imagem indisponível</span>
    </div>
  )
  return <img src={src} className={className} loading="lazy" onError={() => setError(true)} alt="foto" />
}

// ── Modal de visualização / edição ──────────────────────────
function RecordModal({ record, profile, onClose, onDeleted, onUpdated }) {
  const photos  = [record.image_url, record.image_url_2, record.image_url_3].filter(Boolean)
  const isOwner = profile?.id === record.teacher_id || profile?.role === 'admin'

  const [photoIdx, setPhotoIdx] = useState(0)
  const [editing, setEditing]   = useState(false)
  const [title, setTitle]       = useState(record.title)
  const [desc, setDesc]         = useState(record.description || '')
  const [date, setDate]         = useState(record.date)
  const [saving, setSaving]     = useState(false)

  async function handleSave() {
    setSaving(true)
    const { data, error } = await db.from('records')
      .update({ title, description: desc, date })
      .eq('id', record.id).select().single()
    setSaving(false)
    if (!error) { onUpdated(data); setEditing(false) }
  }

  return (
    <div
      className="fixed inset-0 bg-dark/70 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Área de foto */}
        <div className="relative bg-senai-900">
          {photos.length > 0 ? (
            <SafeImg src={photos[photoIdx]} className="w-full h-72 object-cover" />
          ) : (
            <div className="h-40 flex flex-col items-center justify-center gap-2 text-white/50">
              <span className="text-4xl">📷</span>
              <span className="text-xs font-semibold">Nenhuma foto neste registro</span>
            </div>
          )}

          <button onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-dark/50 hover:bg-dark/80 text-white rounded-full flex items-center justify-center text-lg transition-colors"
          >✕</button>

          {photos.length > 1 && (
            <>
              <button onClick={() => setPhotoIdx(i => (i - 1 + photos.length) % photos.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-dark/50 hover:bg-dark/80 text-white rounded-full flex items-center justify-center transition-colors"
              >‹</button>
              <button onClick={() => setPhotoIdx(i => (i + 1) % photos.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-dark/50 hover:bg-dark/80 text-white rounded-full flex items-center justify-center transition-colors"
              >›</button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {photos.map((_, i) => (
                  <button key={i} onClick={() => setPhotoIdx(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${i === photoIdx ? 'bg-white' : 'bg-white/40'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-senai-600 uppercase tracking-wide mb-1">Título</label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full border-2 border-senai-100 rounded-xl px-4 py-2 text-sm outline-none focus:border-senai-600 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-senai-600 uppercase tracking-wide mb-1">Data</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full border-2 border-senai-100 rounded-xl px-4 py-2 text-sm outline-none focus:border-senai-600 transition-colors text-senai-600" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-senai-600 uppercase tracking-wide mb-1">Descrição</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4}
                  className="w-full border-2 border-senai-100 rounded-xl px-4 py-2 text-sm outline-none focus:border-senai-600 transition-colors resize-none" />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={handleSave} disabled={saving}
                  className="bg-senai-600 hover:bg-senai-700 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center gap-2">
                  {saving && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
                <button onClick={() => setEditing(false)}
                  className="border-2 border-senai-100 text-senai-600 font-semibold px-5 py-2 rounded-xl text-sm hover:border-senai-600 transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3 mb-3">
                <h2 className="text-senai-600 font-semibold text-lg leading-tight">{title}</h2>
                {isOwner && (
                  <div className="flex gap-2 flex-shrink-0 flex-wrap">
                    <button onClick={() => setEditing(true)}
                      className="border-2 border-senai-100 hover:border-senai-600 text-senai-600 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors">
                      ✏️ Editar
                    </button>
                    <button onClick={() => onDeleted(record.id)}
                      className="border-2 border-red-100 hover:border-red-500 text-red-500 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors">
                      🗑️ Excluir
                    </button>
                    {photos.length > 0 && (
                      <button onClick={() => downloadPhotos(photos, title)}
                        className="border-2 border-senai-100 hover:border-senai-600 text-senai-600 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors">
                        ⬇️ Baixar fotos
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="text-xs bg-senai-50 text-senai-600 font-semibold px-3 py-1 rounded-full border border-senai-100">
                  {date?.split('-').reverse().join('/')}
                </span>
                <span className="text-xs bg-senai-50 text-senai-600 font-semibold px-3 py-1 rounded-full border border-senai-100">
                  {record.teacher_name}
                </span>
                {photos.length > 0 && (
                  <span className="text-xs bg-senai-50 text-senai-400 font-semibold px-3 py-1 rounded-full border border-senai-100">
                    {photos.length} foto{photos.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                {desc || 'Sem descrição.'}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Card da galeria ─────────────────────────────────────────
function PhotoCard({ record, onClick }) {
  const photos = [record.image_url, record.image_url_2, record.image_url_3].filter(Boolean)
  return (
    <div onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      {photos.length === 0 && (
        <div className="h-48 bg-senai-50 flex flex-col items-center justify-center gap-1 text-senai-400">
          <span className="text-4xl">📷</span>
          <span className="text-xs font-semibold">Sem foto</span>
        </div>
      )}
      {photos.length === 1 && <SafeImg src={photos[0]} className="w-full h-48 object-cover" />}
      {photos.length === 2 && (
        <div className="grid grid-cols-2 gap-0.5 h-48">
          {photos.map((p, i) => <SafeImg key={i} src={p} className="w-full h-full object-cover" />)}
        </div>
      )}
      {photos.length === 3 && (
        <div className="grid grid-cols-2 gap-0.5 h-48">
          <SafeImg src={photos[0]} className="w-full h-full object-cover row-span-2" />
          <SafeImg src={photos[1]} className="w-full h-24 object-cover" />
          <SafeImg src={photos[2]} className="w-full h-24 object-cover" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-senai-600 text-sm leading-tight">{record.title}</h3>
          {photos.length > 1 && (
            <span className="flex-shrink-0 text-xs bg-senai-50 text-senai-600 font-bold px-2 py-0.5 rounded-full border border-senai-100">
              {photos.length} fotos
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 line-clamp-2 mb-3">{record.description || 'Sem descrição'}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-senai-400 font-semibold">{record.date?.split('-').reverse().join('/')}</span>
          <span className="text-xs bg-senai-50 text-senai-600 font-semibold px-2 py-0.5 rounded-full">{record.teacher_name?.split(' ')[0]}</span>
        </div>
      </div>
    </div>
  )
}

// ── Página principal ────────────────────────────────────────
export default function GalleryPage({ profile }) {
  const [records, setRecords]     = useState([])
  const [profiles, setProfiles]   = useState([])
  const [search, setSearch]       = useState('')
  const [dateF, setDateF]         = useState('')
  const [teacherF, setTeacherF]   = useState('')
  const [loading, setLoading]     = useState(true)
  const [loadErr, setLoadErr]     = useState(false)
  const [selected, setSelected]   = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [page, setPage]           = useState(1)

  useEffect(() => { loadData() }, [teacherF, dateF])

  async function loadData() {
    setLoading(true); setLoadErr(false)
    try {
      const { data: profs } = await db.from('profiles').select('*').order('name')
      setProfiles(profs || [])
      let query = db.from('records').select('*')
        .order('date',       { ascending: false })
        .order('created_at', { ascending: false })
      if (profile?.role === 'teacher') query = query.eq('teacher_id', profile.id)
      else if (teacherF)              query = query.eq('teacher_id', teacherF)
      if (dateF)                      query = query.eq('date', dateF)
      const { data, error } = await query
      if (error) throw error
      setRecords(data || [])
      setPage(1)
    } catch {
      setLoadErr(true)
    } finally {
      setLoading(false)
    }
  }

  function handleDeleted(id) { setConfirmId(id) }

  async function confirmDelete() {
    await db.from('records').delete().eq('id', confirmId)
    setRecords(r => r.filter(x => x.id !== confirmId))
    setSelected(null)
    setConfirmId(null)
    toast('Registro excluído com sucesso.', 'success')
  }

  function handleUpdated(updated) {
    setRecords(r => r.map(x => x.id === updated.id ? updated : x))
    setSelected(updated)
    toast('Registro atualizado!', 'success')
  }

  const filtered   = records.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    (r.description || '').toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-senai-600 text-xl font-semibold">Galeria de aulas</h1>
        <span className="text-xs text-senai-400 font-semibold">Clique em um card para ver detalhes</span>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <input type="text" placeholder="Buscar por título..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="flex-1 min-w-48 border-2 border-senai-100 rounded-xl px-4 py-2 text-sm outline-none focus:border-senai-600 transition-colors"
        />
        <input type="date" value={dateF} onChange={e => { setDateF(e.target.value); setPage(1) }}
          className="border-2 border-senai-100 rounded-xl px-4 py-2 text-sm outline-none focus:border-senai-600 transition-colors text-senai-600"
        />
        {profile?.role === 'admin' && (
          <select value={teacherF} onChange={e => { setTeacherF(e.target.value); setPage(1) }}
            className="border-2 border-senai-100 rounded-xl px-4 py-2 text-sm outline-none focus:border-senai-600 transition-colors text-senai-600">
            <option value="">Todos os professores</option>
            {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}
        {(search || dateF || teacherF) && (
          <button onClick={() => { setSearch(''); setDateF(''); setTeacherF(''); setPage(1) }}
            className="border-2 border-senai-100 text-senai-400 hover:border-senai-600 hover:text-senai-600 rounded-xl px-4 py-2 text-sm font-semibold transition-colors">
            Limpar
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-senai-400">
          <div className="w-6 h-6 border-2 border-senai-100 border-t-senai-600 rounded-full animate-spin" />
          <span className="text-sm font-semibold">Carregando...</span>
        </div>
      ) : loadErr ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">⚠️</div>
          <p className="text-senai-600 font-semibold mb-1">Erro ao carregar registros</p>
          <p className="text-senai-400 text-xs mb-4">Verifique sua conexão e tente novamente</p>
          <button onClick={loadData}
            className="bg-senai-600 text-white font-semibold px-5 py-2 rounded-xl text-sm hover:bg-senai-700 transition-colors">
            Tentar novamente
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-3 opacity-30">🖼️</div>
          <p className="text-senai-400 font-semibold mb-1">Nenhum registro encontrado</p>
          <p className="text-senai-100 text-xs">
            {search || dateF || teacherF
              ? 'Tente ajustar os filtros de busca'
              : 'Comece registrando sua primeira aula na aba "＋ Registrar Aula"'}
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-senai-400 font-semibold mb-4">
            {filtered.length} registro{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginated.map(r => (
              <PhotoCard key={r.id} record={r} onClick={() => setSelected(r)} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 rounded-xl border-2 border-senai-100 text-senai-600 font-semibold text-sm hover:border-senai-600 transition-colors disabled:opacity-30"
              >← Anterior</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors
                    ${p === page ? 'bg-senai-600 text-white' : 'border-2 border-senai-100 text-senai-600 hover:border-senai-600'}`}
                >{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-4 py-2 rounded-xl border-2 border-senai-100 text-senai-600 font-semibold text-sm hover:border-senai-600 transition-colors disabled:opacity-30"
              >Próxima →</button>
            </div>
          )}
        </>
      )}

      {selected && (
        <RecordModal
          record={selected}
          profile={profile}
          onClose={() => setSelected(null)}
          onDeleted={handleDeleted}
          onUpdated={handleUpdated}
        />
      )}

      {confirmId && (
        <ConfirmModal
          title="Excluir registro"
          message="Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita."
          onConfirm={confirmDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  )
}