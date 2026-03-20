export default function ConfirmModal({ title, message, onConfirm, onCancel, loading }) {
  return (
    <div
      className="fixed inset-0 bg-dark/60 z-[60] flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onCancel()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">

        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <span className="text-red-500 text-xl">🗑️</span>
        </div>

        <h3 className="text-senai-600 font-semibold text-center text-lg mb-2">
          {title || 'Confirmar exclusão'}
        </h3>
        <p className="text-gray-400 text-sm text-center mb-6 leading-relaxed">
          {message || 'Esta ação não pode ser desfeita.'}
        </p>

        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 border-2 border-senai-100 text-senai-600 font-semibold py-2.5 rounded-xl text-sm hover:border-senai-600 transition-colors disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {loading ? 'Excluindo...' : 'Sim, excluir'}
          </button>
        </div>

      </div>
    </div>
  )
}