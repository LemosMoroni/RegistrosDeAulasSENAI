import { useState } from 'react'
import { db } from '../lib/supabase'

export default function Navbar({ profile, tab, setTab }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const tabs = [
    { id: 'upload',  label: '＋ Registrar Aula' },
    { id: 'gallery', label: 'Galeria' },
    { id: 'pdf',     label: 'Relatório PDF' },
    ...(profile?.role === 'admin'
      ? [{ id: 'admin', label: 'Painel Admin' }]
      : []),
  ]

  function handleTab(id) {
    setTab(id)
    setMenuOpen(false)
  }

  async function handleLogout() {
    await db.auth.signOut()
  }

  return (
    <>
      <nav className="bg-white border-b-2 border-senai-600 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">

          <img src="/Logo-SENAI_EP.png" alt="SENAI" className="h-8 w-auto flex-shrink-0" />
          <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block" />
          <span className="text-senai-600 text-sm font-semibold hidden sm:block">Registro de Aulas</span>

          {/* Tabs desktop */}
          <div className="hidden md:flex gap-1 bg-senai-50 rounded-xl p-1 mx-auto">
            {tabs.map(t => (
              <button key={t.id} onClick={() => handleTab(t.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap
                  ${tab === t.id ? 'bg-senai-600 text-white shadow-sm' : 'text-gray-500 hover:text-senai-600'}`}
              >{t.label}</button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
            <span className="bg-senai-50 text-senai-600 text-xs font-bold px-3 py-1 rounded-full border border-senai-100 hidden sm:block">
              {profile?.name?.split(' ')[0]}
              {profile?.role === 'admin' && <span className="ml-1 text-senai-400">(Admin)</span>}
            </span>
            <button onClick={handleLogout}
              className="border border-senai-600 text-senai-600 hover:bg-senai-600 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hidden sm:block"
            >Sair</button>

            {/* Hamburguer mobile */}
            <button onClick={() => setMenuOpen(o => !o)}
              className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-senai-50 transition-colors"
            >
              <span className={`block w-5 h-0.5 bg-senai-600 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-senai-600 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-senai-600 transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {menuOpen && (
          <div className="md:hidden border-t border-senai-50 bg-white px-4 py-3 flex flex-col gap-1">
            {tabs.map(t => (
              <button key={t.id} onClick={() => handleTab(t.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors
                  ${tab === t.id ? 'bg-senai-600 text-white' : 'text-gray-500 hover:bg-senai-50 hover:text-senai-600'}`}
              >{t.label}</button>
            ))}
            <div className="border-t border-senai-50 mt-2 pt-3 flex items-center justify-between">
              <span className="text-xs text-senai-400 font-semibold">
                {profile?.name} {profile?.role === 'admin' && '(Admin)'}
              </span>
              <button onClick={handleLogout}
                className="border border-senai-600 text-senai-600 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-senai-600 hover:text-white transition-colors"
              >Sair</button>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}