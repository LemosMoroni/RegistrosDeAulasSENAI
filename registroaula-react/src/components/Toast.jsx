import { useState, useEffect, useCallback } from 'react'

let addToast = () => {}

export function toast(message, type = 'success') {
  addToast({ message, type, id: Date.now() })
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([])

  const remove = useCallback(id => {
    setToasts(t => t.filter(x => x.id !== id))
  }, [])

  useEffect(() => {
    addToast = item => {
      setToasts(t => [...t, item])
      setTimeout(() => remove(item.id), 3500)
    }
  }, [remove])

  const styles = {
    success: 'bg-senai-600 text-white',
    error:   'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
  }

  const icons = {
    success: '✓',
    error:   '✕',
    warning: '⚠',
  }

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold max-w-sm animate-bounce-in ${styles[t.type] || styles.success}`}
        >
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {icons[t.type] || icons.success}
          </span>
          <span className="flex-1">{t.message}</span>
          <button onClick={() => remove(t.id)}
            className="text-white/60 hover:text-white ml-1 text-base leading-none"
          >✕</button>
        </div>
      ))}
    </div>
  )
}