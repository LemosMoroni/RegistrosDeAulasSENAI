import { useState } from 'react'
import { db } from '../lib/supabase'
import { toast } from '../components/Toast'

export default function SetPasswordPage({ user, onDone }) {
  const [pass, setPass]           = useState('')
  const [confirmPass, setConfirm] = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  async function handleSave() {
    if (!pass || !confirmPass)  { setError('Preencha os dois campos.'); return }
    if (pass.length < 6)        { setError('Senha deve ter pelo menos 6 caracteres.'); return }
    if (pass !== confirmPass)   { setError('As senhas não coincidem.'); return }
    setLoading(true); setError('')
    const { error: e } = await db.auth.updateUser({ password: pass })
    if (e) { setError(e.message); setLoading(false); return }
    // Marca que o usuário já definiu a senha
    await db.from('profiles').update({ must_change_password: false }).eq('id', user.id)
    setLoading(false)
    toast('Senha definida com sucesso! Bem-vindo ao RegistroAula!')
    onDone()
  }

  return (
    <div className="min-h-screen bg-senai-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="w-14 h-14 bg-senai-50 rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-senai-100">
          <span className="text-3xl">🔑</span>
        </div>
        <h2 className="text-senai-600 font-semibold text-xl text-center mb-1">Bem-vindo ao RegistroAula!</h2>
        <p className="text-gray-400 text-sm text-center mb-6 leading-relaxed">
          Defina uma senha para acessar o sistema.
        </p>

        {error && <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg">{error}</div>}

        <div className="mb-4">
          <label className="block text-xs font-semibold text-senai-600 uppercase tracking-wide mb-1">Nova senha</label>
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)}
              placeholder="mínimo 6 caracteres"
              className="w-full border-2 border-senai-100 rounded-xl px-4 py-3 pr-20 text-sm outline-none focus:border-senai-600 transition-colors" />
            <button type="button" onClick={() => setShowPass(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-senai-400 hover:text-senai-600 text-xs font-semibold">
              {showPass ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          {pass.length > 0 && (
            <div className="mt-2 flex gap-1">
              {[1,2,3,4].map(n => (
                <div key={n} className={`h-1 flex-1 rounded-full transition-colors ${pass.length >= n*2 ? pass.length >= 10 ? 'bg-green-400' : pass.length >= 6 ? 'bg-yellow-400' : 'bg-red-300' : 'bg-gray-200'}`} />
              ))}
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-xs font-semibold text-senai-600 uppercase tracking-wide mb-1">Confirmar senha</label>
          <input type="password" value={confirmPass} onChange={e => setConfirm(e.target.value)} placeholder="••••••••"
            className={`w-full border-2 rounded-xl px-4 py-3 text-sm outline-none transition-colors ${confirmPass.length > 0 ? pass === confirmPass ? 'border-green-400' : 'border-red-300' : 'border-senai-100 focus:border-senai-600'}`} />
          {confirmPass.length > 0 && (
            <p className={`text-xs mt-1 font-semibold ${pass === confirmPass ? 'text-green-500' : 'text-red-400'}`}>
              {pass === confirmPass ? '✓ Senhas coincidem' : '✕ Senhas não coincidem'}
            </p>
          )}
        </div>

        <button onClick={handleSave}
          disabled={loading || (confirmPass.length > 0 && pass !== confirmPass)}
          className="w-full bg-senai-600 hover:bg-senai-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {loading ? 'Salvando...' : 'Definir senha e entrar'}
        </button>
      </div>
    </div>
  )
}