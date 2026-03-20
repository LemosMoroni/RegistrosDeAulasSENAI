import { useState, useEffect } from 'react'
import { db }               from './lib/supabase'
import LoginPage            from './pages/LoginPage'
import SetPasswordPage      from './pages/SetPasswordPage'
import EmailConfirmedPage   from './pages/EmailConfirmedPage'
import UploadPage           from './pages/UploadPage'
import GalleryPage          from './pages/GalleryPage'
import AdminPage            from './pages/AdminPage'
import PdfPage              from './pages/PdfPage'
import Navbar               from './components/Navbar'
import ToastContainer       from './components/Toast'

function App() {
  const [screen, setScreen]   = useState(null)
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [tab, setTab]         = useState('upload')

  useEffect(() => {
    // Detecta token de confirmação de e-mail na URL
    const params    = new URLSearchParams(window.location.search)
    const tokenHash = params.get('token_hash')
    const type      = params.get('type')

    if (tokenHash && type === 'signup') {
      // Verifica o token e mostra tela de confirmação
      db.auth.verifyOtp({ token_hash: tokenHash, type: 'signup' })
        .then(({ error }) => {
          if (!error) {
            // Desloga imediatamente — usuário deve logar manualmente
            db.auth.signOut()
            window.history.replaceState({}, '', window.location.pathname)
            setScreen('email-confirmed')
          } else {
            setScreen('auth')
          }
        })
      return
    }

    db.auth.getSession().then(({ data: { session } }) => {
      if (session) loadProfile(session.user)
      else setScreen('auth')
    })

    const { data: listener } = db.auth.onAuthStateChange((_event, session) => {
      if (_event === 'SIGNED_OUT') {
        setUser(null); setProfile(null)
        setScreen('auth'); setTab('upload')
      }
      if ((_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') && session) {
        loadProfile(session.user)
      }
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function loadProfile(u) {
    setUser(u)
    const { data } = await db.from('profiles').select('*').eq('id', u.id).single()
    if (!data) {
      const name = u.user_metadata?.name || u.email.split('@')[0]
      await db.from('profiles').upsert({ id: u.id, name, email: u.email, role: 'teacher', must_change_password: true })
      setProfile({ id: u.id, name, email: u.email, role: 'teacher', must_change_password: true })
      setScreen('set-password')
    } else {
      setProfile(data)
      setScreen(data.must_change_password ? 'set-password' : 'app')
    }
  }

  if (screen === null) return (
    <div className="min-h-screen bg-senai-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-senai-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (screen === 'email-confirmed') return (
    <><EmailConfirmedPage /><ToastContainer /></>
  )

  if (screen === 'auth') return (
    <><LoginPage /><ToastContainer /></>
  )

  if (screen === 'set-password') return (
    <>
      <SetPasswordPage
        user={user}
        onDone={() => { setProfile(p => ({ ...p, must_change_password: false })); setScreen('app') }}
      />
      <ToastContainer />
    </>
  )

  return (
    <div className="min-h-screen bg-senai-50">
      <Navbar profile={profile} tab={tab} setTab={setTab} />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {tab === 'upload'  && <UploadPage  user={user} profile={profile} />}
        {tab === 'gallery' && <GalleryPage profile={profile} />}
        {tab === 'pdf'     && <PdfPage     profile={profile} />}
        {tab === 'admin'   && <AdminPage   currentUser={user} />}
      </main>
      <ToastContainer />
    </div>
  )
}

export default App