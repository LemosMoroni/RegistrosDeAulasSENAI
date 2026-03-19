import { useState } from 'react'
import { db } from '../lib/supabase'

const MAX = 3
const MAX_SIZE = 5 * 1024 * 1024

export default function UploadPage({ user, profile }) {
  const [files, setFiles]     = useState([])
  const [title, setTitle]     = useState('')
  const [date, setDate]       = useState(new Date().toISOString().split('T')[0])
  const [desc, setDesc]       = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError]     = useState('')

  function handleFileChange(e, index) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > MAX_SIZE) { setError('Foto muito grande. Máximo 5 MB.'); return }
    const updated = [...files]
    updated[index] = file
    setFiles(updated.filter(Boolean))
    setError('')
  }

  function removeFile(index) {
    const updated = [...files]
    updated.splice(index, 1)
    setFiles(updated)
  }

  async function handleSave() {
    if (!title || !date) { setError('Preencha o título e a data.'); return }
    setLoading(true); setError('')

    const urls = []
    for (let i = 0; i < files.length; i++) {
      const ext  = files[i].name.split('.').pop()
      const path = `${user.id}/${Date.now()}-${i}.${ext}`
      const { error: upErr } = await db.storage.from('aulas').upload(path, files[i], { upsert: true })
      if (upErr) { setError('Erro ao enviar foto: ' + upErr.message); setLoading(false); return }
      const { data } = db.storage.from('aulas').getPublicUrl(path)
      urls.push(data.publicUrl)
    }

    const { error: dbErr } = await db.from('records').insert({
      teacher_id:   user.id,
      teacher_name: profile.name,
      title, description: desc, date,
      image_url:   urls[0] || null,
      image_url_2: urls[1] || null,
      image_url_3: urls[2] || null,
    })

    setLoading(false)
    if (dbErr) { setError('Erro ao salvar: ' + dbErr.message); return }
    setSuccess(`Aula registrada com ${urls.length || 'nenhuma'} foto${urls.length !== 1 ? 's' : ''}!`)
    setTitle(''); setDesc(''); setFiles([])
    setDate(new Date().toISOString().split('T')[0])
    setTimeout(() => setSuccess(''), 4000)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-senai-600 text-xl font-semibold mb-6">Registrar nova aula</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

        {error   && <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg">{error}</div>}
        {success && <div className="mb-4 p-3 bg-senai-50 border-l-4 border-senai-600 text-senai-900 text-sm rounded-r-lg">{success}</div>}

        {/* Slots de foto */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-senai-600 uppercase tracking-wide mb-2">
            Fotos da aula <span className="normal-case font-normal text-senai-400">até 3 fotos</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map(i => (
              <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden relative">
                {files[i] ? (
                  <div className="w-full h-full relative group">
                    <img
                      src={URL.createObjectURL(files[i])}
                      className="w-full h-full object-cover"
                      alt={`foto ${i+1}`}
                    />
                    <div className="absolute inset-0 bg-senai-600/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => removeFile(i)}
                        className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-lg">
                        Remover
                      </button>
                    </div>
                    <span className="absolute top-2 left-2 w-5 h-5 rounded-full bg-senai-600 text-white text-xs font-bold flex items-center justify-center">
                      {i+1}
                    </span>
                  </div>
                ) : i <= files.length ? (
                  <label className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-senai-100 rounded-xl cursor-pointer hover:border-senai-400 hover:bg-senai-50 transition-colors">
                    <span className="text-2xl text-senai-400 mb-1">+</span>
                    <span className="text-xs text-senai-400 font-semibold">Foto {i+1}</span>
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => handleFileChange(e, i)} />
                  </label>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-senai-50 rounded-xl">
                    <span className="text-xs text-senai-100 font-semibold">Foto {i+1}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-right text-xs text-senai-400 mt-1 font-semibold">
            {files.length} de {MAX} foto{files.length !== 1 ? 's' : ''} selecionada{files.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Título e Data */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-senai-600 uppercase tracking-wide mb-1">Título</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Introdução à Indústria 4.0"
              className="w-full border-2 border-senai-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-senai-600 transition-colors placeholder:text-senai-100" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-senai-600 uppercase tracking-wide mb-1">Data</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full border-2 border-senai-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-senai-600 transition-colors text-senai-600" />
          </div>
        </div>

        {/* Descrição */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-senai-600 uppercase tracking-wide mb-1">Descrição</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3}
            placeholder="Descreva a aula, atividades, objetivos..."
            className="w-full border-2 border-senai-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-senai-600 transition-colors resize-none placeholder:text-senai-100" />
        </div>

        {/* Botão salvar */}
        <button onClick={handleSave} disabled={loading}
          className="bg-senai-600 hover:bg-senai-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2">
          {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {loading ? 'Salvando...' : 'Salvar registro'}
        </button>

      </div>
    </div>
  )
}