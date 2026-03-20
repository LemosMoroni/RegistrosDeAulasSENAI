import { useState, useEffect } from 'react'
import { db } from '../lib/supabase'
import { toast } from '../components/Toast'

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 border-t-4 border-t-senai-600">
      <p className="text-xs font-semibold text-senai-600 uppercase tracking-wide mb-2">{label}</p>
      <p className="text-3xl font-light text-senai-600">{value}</p>
    </div>
  )
}

export default function AdminPage({ currentUser }) {
  const [profiles, setProfiles]       = useState([])
  const [records, setRecords]         = useState([])
  const [loading, setLoading]         = useState(true)

  // Form adicionar
  const [name, setName]               = useState('')
  const [email, setEmail]             = useState('')
  const [pass, setPass]               = useState('')
  const [showPass, setShowPass]       = useState(false)
  const [role, setRole]               = useState('teacher')
  const [adding, setAdding]           = useState(false)
  const [addMsg, setAddMsg]           = useState(null)

  // Modal redefinir senha
  const [resetUser, setResetUser]     = useState(null)
  const [newPass, setNewPass]         = useState('')
  const [showNewPass, setShowNewPass] = useState(false)
  const [resetting, setResetting]     = useState(false)
  const [resetMsg, setResetMsg]       = useState(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const [{ data: profs }, { data: recs }] = await Promise.all([
      db.from('profiles').select('*').order('name'),
      db.from('records').select('id, teacher_id, image_url, date'),
    ])
    setProfiles(profs || [])
    setRecords(recs || [])
    setLoading(false)
  }

  async function handleAdd() {
    if (!name || !email || !pass) { setAddMsg({ type: 'error', text: 'Preencha todos os campos.' }); return }
    if (pass.length < 6)         { setAddMsg({ type: 'error', text: 'Senha mínima de 6 caracteres.' }); return }
    setAdding(true); setAddMsg(null)
    const { data, error } = await db.auth.signUp({
      email, password: pass, options: { data: { name } }
    })
    if (error) { setAddMsg({ type: 'error', text: error.message }); setAdding(false); return }
    if (data.user)
      await db.from('profiles').upsert({
        id: data.user.id, name, email, role,
        must_change_password: true
      })
    setAdding(false)
    setAddMsg({ type: 'success', text: `${name} adicionado! Ele deverá confirmar o e-mail e definir sua senha.` })
    setName(''); setEmail(''); setPass(''); setRole('teacher')
    loadData()
  }

  async function handleRemove(id, userName) {
    if (!confirm(`Remover ${userName}? Todos os registros deste professor também serão excluídos.`)) return
    await db.from('records').delete().eq('teacher_id', id)
    await db.from('profiles').delete().eq('id', id)
    toast(`${userName} removido.`, 'success')
    loadData()
  }

  async function handleResetPassword() {
    if (!newPass || newPass.length < 6) {
      setResetMsg({ type: 'error', text: 'Senha mínima de 6 caracteres.' }); return
    }
    setResetting(true); setResetMsg(null)
    const { error } = await db.from('profiles')
      .update({ must_change_password: true })
      .eq('id', resetUser.id)
    setResetting(false)
    if (error) { setResetMsg({ type: 'error', text: error.message }); return }
    toast(`Senha de ${resetUser.name} redefinida! Ele será solicitado a trocar no próximo login.`)
    setResetUser(null); setNewPass('')
  }

  const today        = new Date().toISOString().split('T')[0]
  const teachers     = profiles.filter(p => p.role === 'teacher')
  const todayRecords = records.filter(r => r.date === today)
  const withPhotos   = records.filter(r => r.image_url)
  const recCount     = id => records.filter(r => r.teacher_id === id).length

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-3 text-senai-400">
      <div className="w-6 h-6 border-2 border-senai-100 border-t-senai-600 rounded-full animate-spin" />
      <span className="text-sm font-semibold">Carregando...</span>
    </div>
  )

  return (
    <div>
      <h1 className="text-senai-600 text-xl font-semibold mb-6">Painel administrativo</h1>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total de registros" value={records.length} />
        <StatCard label="Professores"         value={teachers.length} />
        <StatCard label="Registros hoje"      value={todayRecords.length} />
        <StatCard label="Com fotos"           value={withPhotos.length} />
      </div>

      {/* Adicionar professor */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-senai-600 font-semibold mb-4">Adicionar professor / administrador</h2>
        {addMsg && (
          <div className={`mb-4 p-3 border-l-4 text-sm rounded-r-lg ${addMsg.type === 'error' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-senai-50 border-senai-600 text-senai-900'}`}>
            {addMsg.text}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-senai-600 uppercase tracking-wide mb-1">Nome completo</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nome do professor"
              className="w-full border-2 border-senai-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-senai-600 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-senai-600 uppercase tracking-wide mb-1">E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="professor@escola.com"
              className="w-full border-2 border-senai-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-senai-600 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-senai-600 uppercase tracking-wide mb-1">Senha inicial</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)} placeholder="mínimo 6 caracteres"
                className="w-full border-2 border-senai-100 rounded-xl px-4 py-2.5 pr-20 text-sm outline-none focus:border-senai-600 transition-colors" />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-senai-400 hover:text-senai-600 text-xs font-semibold">
                {showPass ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-senai-600 uppercase tracking-wide mb-1">Perfil</label>
            <select value={role} onChange={e => setRole(e.target.value)}
              className="w-full border-2 border-senai-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-senai-600 transition-colors text-senai-600">
              <option value="teacher">Professor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>
        <button onClick={handleAdd} disabled={adding}
          className="bg-senai-600 hover:bg-senai-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center gap-2">
          {adding && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {adding ? 'Adicionando...' : 'Adicionar usuário'}
        </button>
      </div>

      {/* Lista de usuários */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-senai-50 bg-senai-50">
          <h2 className="text-senai-600 font-semibold">Usuários cadastrados</h2>
        </div>
        {profiles.map(p => (
          <div key={p.id}
            className="flex items-center justify-between px-6 py-4 border-b border-senai-50 last:border-0 hover:bg-senai-50/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-senai-50 border border-senai-100 text-senai-600 font-bold text-sm flex items-center justify-center flex-shrink-0">
                {p.name.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-senai-600 text-sm">{p.name}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.role === 'admin' ? 'bg-senai-600 text-white' : 'bg-senai-50 text-senai-400 border border-senai-100'}`}>
                    {p.role === 'admin' ? 'Admin' : 'Professor'}
                  </span>
                  {p.must_change_password && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-600 border border-yellow-200">
                      ⚠ Troca de senha pendente
                    </span>
                  )}
                </div>
                <span className="text-xs text-senai-400">{p.email}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <span className="text-xs text-senai-400 font-semibold hidden sm:block">
                {recCount(p.id)} registro{recCount(p.id) !== 1 ? 's' : ''}
              </span>
              {p.id !== currentUser?.id ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setResetUser({ id: p.id, name: p.name }); setNewPass(''); setShowNewPass(false); setResetMsg(null) }}
                    className="border-2 border-senai-100 hover:border-senai-600 text-senai-600 font-semibold px-3 py-1 rounded-lg text-xs transition-colors">
                    🔑 Senha
                  </button>
                  <button onClick={() => handleRemove(p.id, p.name)}
                    className="border-2 border-red-100 hover:border-red-500 text-red-400 hover:text-red-500 font-semibold px-3 py-1 rounded-lg text-xs transition-colors">
                    Remover
                  </button>
                </div>
              ) : (
                <span className="text-xs text-senai-100 font-semibold px-3 py-1">você</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal redefinir senha */}
      {resetUser && (
        <div className="fixed inset-0 bg-dark/60 z-50 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setResetUser(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-senai-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-senai-100">
              <span className="text-xl">🔑</span>
            </div>
            <h3 className="text-senai-600 font-semibold text-lg text-center mb-1">Redefinir senha</h3>
            <p className="text-gray-400 text-xs text-center mb-4 leading-relaxed">
              Definindo nova senha para <b className="text-senai-600">{resetUser.name}</b>.
              
O professor será solicitado a trocar no próximo login.
            </p>
            {resetMsg && (
              <div className={`mb-3 p-3 border-l-4 text-sm rounded-r-lg ${resetMsg.type === 'error' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-senai-50 border-senai-600 text-senai-900'}`}>
                {resetMsg.text}
              </div>
            )}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-senai-600 uppercase tracking-wide mb-1">Nova senha</label>
              <div className="relative">
                <input type={showNewPass ? 'text' : 'password'} value={newPass} onChange={e => setNewPass(e.target.value)}
                  placeholder="mínimo 6 caracteres"
                  className="w-full border-2 border-senai-100 rounded-xl px-4 py-2.5 pr-20 text-sm outline-none focus:border-senai-600 transition-colors" />
                <button type="button" onClick={() => setShowNewPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-senai-400 hover:text-senai-600 text-xs font-semibold">
                  {showNewPass ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setResetUser(null)}
                className="flex-1 border-2 border-senai-100 text-senai-600 font-semibold py-2.5 rounded-xl text-sm hover:border-senai-600 transition-colors">
                Cancelar
              </button>
              <button onClick={handleResetPassword} disabled={resetting}
                className="flex-1 bg-senai-600 hover:bg-senai-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {resetting && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {resetting ? 'Salvando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}