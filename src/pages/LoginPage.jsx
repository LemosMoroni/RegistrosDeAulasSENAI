import { useState } from 'react'
import { db } from '../lib/supabase'
import senaiLogo from '/public/Logo-SENAI_EP.png'

function EmailSentScreen({ email, onBack }) {
  return (
    <div className="min-h-screen bg-senai-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 bg-senai-50 rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-senai-100">
          <span className="text-3xl">📧</span>
        </div>
        <h2 className="text-senai-600 font-semibold text-xl mb-2">Verifique seu e-mail</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-2">Enviamos um link de confirmação para:</p>
        <p className="text-senai-600 font-semibold text-sm mb-5 bg-senai-50 border border-senai-100 rounded-xl px-4 py-2">{email}</p>
        <div className="bg-senai-50 border border-senai-100 rounded-xl p-4 text-xs text-senai-600 text-left space-y-1 mb-6">
          <p className="font-semibold mb-2">Próximos passos:</p>
          <p>1. Abra sua caixa de entrada</p>
          <p>2. Clique no link de confirmação</p>
          <p>3. Volte aqui e faça login normalmente</p>
          <p>4. Na tela seguinte, defina sua senha</p>
          <p className="text-senai-400 mt-2">Não recebeu? Verifique a pasta de spam.</p>
        </div>
        <button onClick={onBack}
          className="w-full bg-senai-600 hover:bg-senai-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
          Voltar para o login
        </button>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const [mode, setMode]               = useState('login')
  const [email, setEmail]             = useState('')
  const [pass, setPass]               = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [name, setName]               = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [emailSent, setEmailSent]     = useState(false)
  const [showPass, setShowPass]       = useState(false)

  async function handleLogin() {
    if (!email || !pass) { setError('Preencha e-mail e senha.'); return }
    setLoading(true); setError('')
    const { error: e } = await db.auth.signInWithPassword({ email, password: pass })
    setLoading(false)
    if (e) setError(
      e.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.'
      : e.message === 'Email not confirmed'      ? 'E-mail ainda não confirmado. Verifique sua caixa de entrada.'
      : e.message
    )
  }

  async function handleRegister() {
    if (!name || !email || !pass || !confirmPass) { setError('Preencha todos os campos.'); return }
    if (pass.length < 6)    { setError('Senha deve ter pelo menos 6 caracteres.'); return }
    if (pass !== confirmPass) { setError('As senhas não coincidem.'); return }
    setLoading(true); setError('')
    const { data, error: e } = await db.auth.signUp({ email, password: pass, options: { data: { name } } })
    if (e) { setError(e.message); setLoading(false); return }
    if (data.user)
      await db.from('profiles').upsert({ id: data.user.id, name, email, role: 'teacher', must_change_password: true })
    setLoading(false)
    setEmailSent(true)
  }

  function switchMode(m) { setMode(m); setError(''); setPass(''); setConfirmPass('') }

  if (emailSent) return <EmailSentScreen email={email} onBack={() => { setEmailSent(false); setMode('login'); setPass(''); setConfirmPass(''); setError('') }} />

  return (
    <div className="min-h-screen bg-senai-600 flex items-center justify-center p-4">
      <div className="flex w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl">

        <div className="hidden md:flex flex-col justify-between bg-senai-900 w-80 flex-shrink-0 p-8">
          <div>
            <img src={senaiLogo} alt="SENAI" className="w-44 mb-6 brightness-0 invert" />
            <p className="text-white/60 text-sm leading-relaxed">Banco de dados fotográfico de aulas para professores</p>
          </div>
          <ul className="space-y-3">
            {['Registro diário de fotos','Galeria com filtros','Relatório PDF','Painel administrativo','Sincronizado em tempo real'].map(f => (
              <li key={f} className="flex items-center gap-2 text-white/80 text-sm">
                <span className="w-2 h-2 rounded-full bg-senai-400 flex-shrink-0" />{f}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white flex-1 p-8">
          <h2 className="text-senai-600 font-semibold text-2xl mb-1">{mode === 'login' ? 'Bem-vindo professor(a)!' : 'Criar conta'}</h2>
          <p className="text-gray-400 text-sm mb-6">{mode === 'login' ? 'Entre com suas credenciais' : 'Preencha os dados para se registrar'}</p>

          {error && <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg">{error}</div>}

          {mode === 'register' && (
            <div className="mb-4">
              <label className="block text-xs font-semibold text-senai-600 uppercase tracking-wide mb-1">Nome completo</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome"
                className="w-full border-2 border-senai-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-senai-600 transition-colors" />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-semibold text-senai-600 uppercase tracking-wide mb-1">E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com"
              onKeyDown={e => e.key === 'Enter' && mode === 'login' && handleLogin()}
              className="w-full border-2 border-senai-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-senai-600 transition-colors" />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-senai-600 uppercase tracking-wide mb-1">Senha</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••"
                onKeyDown={e => e.key === 'Enter' && mode === 'login' && handleLogin()}
                className="w-full border-2 border-senai-100 rounded-xl px-4 py-3 pr-12 text-sm outline-none focus:border-senai-600 transition-colors" />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-senai-400 hover:text-senai-600 text-xs font-semibold">
                {showPass ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {mode === 'register' && pass.length > 0 && (
              <div className="mt-2 flex gap-1">
                {[1,2,3,4].map(n => (
                  <div key={n} className={`h-1 flex-1 rounded-full transition-colors ${pass.length >= n*2 ? pass.length >= 10 ? 'bg-green-400' : pass.length >= 6 ? 'bg-yellow-400' : 'bg-red-300' : 'bg-gray-200'}`} />
                ))}
              </div>
            )}
          </div>

          {mode === 'register' && (
            <div className="mb-6">
              <label className="block text-xs font-semibold text-senai-600 uppercase tracking-wide mb-1">Confirmar senha</label>
              <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="••••••••"
                className={`w-full border-2 rounded-xl px-4 py-3 text-sm outline-none transition-colors ${confirmPass.length > 0 ? pass === confirmPass ? 'border-green-400' : 'border-red-300' : 'border-senai-100 focus:border-senai-600'}`} />
              {confirmPass.length > 0 && (
                <p className={`text-xs mt-1 font-semibold ${pass === confirmPass ? 'text-green-500' : 'text-red-400'}`}>
                  {pass === confirmPass ? '✓ Senhas coincidem' : '✕ Senhas não coincidem'}
                </p>
              )}
            </div>
          )}

          {mode === 'login' && <div className="mb-6" />}

          <button onClick={mode === 'login' ? handleLogin : handleRegister}
            disabled={loading || (mode === 'register' && confirmPass.length > 0 && pass !== confirmPass)}
            className="w-full bg-senai-600 hover:bg-senai-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {loading ? (mode === 'login' ? 'Entrando...' : 'Criando conta...') : (mode === 'login' ? 'Entrar' : 'Criar conta')}
          </button>

          <p className="text-center text-sm text-gray-400 mt-4">
            {mode === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
            <span onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="text-senai-600 font-semibold cursor-pointer hover:underline">
              {mode === 'login' ? 'Criar conta' : 'Entrar'}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}