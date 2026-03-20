export default function EmailConfirmedPage() {
  return (
    <div className="min-h-screen bg-senai-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">

        <img src={`${import.meta.env.BASE_URL}Logo-SENAI_EP.png`} alt="SENAI" className="h-10 w-auto mx-auto mb-6" />

        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-green-100">
          <span className="text-3xl">✅</span>
        </div>

        <h2 className="text-senai-600 font-semibold text-xl mb-2">
          E-mail confirmado!
        </h2>

        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          Sua conta foi verificada com sucesso. Agora você pode acessar o
          sistema <b className="text-senai-600">RegistroAula SENAI</b>.
        </p>

        <div className="bg-senai-50 border border-senai-100 rounded-xl p-4 text-xs text-senai-600 text-left space-y-1 mb-6">
          <p className="font-semibold mb-2">Próximos passos:</p>
          <p>1. Clique no botão abaixo para ir ao site</p>
          <p>2. Faça login com seu e-mail e senha</p>
          <p>3. Defina sua senha de acesso</p>
          <p>4. Comece a registrar suas aulas! 📷</p>
        </div>

        <a
          href={window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/')}
          className="block w-full bg-senai-600 hover:bg-senai-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          onClick={() => {
            window.history.replaceState({}, '', window.location.pathname)
          }}
        >
          Ir para o RegistroAula
        </a>

      </div>
    </div>
  )
}