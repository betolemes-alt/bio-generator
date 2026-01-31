'use client'

import { useState } from 'react'

export default function Home() {
  const [profissao, setProfissao] = useState('')
  const [palavras, setPalavras] = useState('')
  const [plataforma, setPlataforma] = useState('instagram')
  const [bios, setBios] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)

  const gerarBio = async () => {
    if (!profissao.trim()) return

    setLoading(true)
    setBios([])

    try {
      const response = await fetch('/api/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profissao, palavras, plataforma })
      })

      const data = await response.json()
      if (data.bios) {
        setBios(data.bios)
      }
    } catch (error) {
      console.error('Erro ao gerar bio:', error)
    } finally {
      setLoading(false)
    }
  }

  const copiarBio = (index: number, bio: string) => {
    navigator.clipboard.writeText(bio)
    setCopied(index)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Gerador de Bio
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"> com IA</span>
          </h1>
          <p className="text-xl text-gray-300">
            Crie bios profissionais para suas redes sociais em segundos
          </p>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <div className="space-y-6">
            {/* Profissao */}
            <div>
              <label className="block text-white font-medium mb-2">
                Qual sua profissao?
              </label>
              <input
                type="text"
                value={profissao}
                onChange={(e) => setProfissao(e.target.value)}
                placeholder="Ex: Designer, Advogado, Coach, Nutricionista..."
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Palavras-chave */}
            <div>
              <label className="block text-white font-medium mb-2">
                3 palavras que te descrevem (opcional)
              </label>
              <input
                type="text"
                value={palavras}
                onChange={(e) => setPalavras(e.target.value)}
                placeholder="Ex: criativo, focado, inovador"
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Plataforma */}
            <div>
              <label className="block text-white font-medium mb-2">
                Para qual plataforma?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['instagram', 'linkedin', 'twitter'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlataforma(p)}
                    className={`py-3 px-4 rounded-lg font-medium transition-all ${
                      plataforma === p
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-white/20 text-gray-300 hover:bg-white/30'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Botao Gerar */}
            <button
              onClick={gerarBio}
              disabled={loading || !profissao.trim()}
              className="w-full py-4 rounded-lg font-bold text-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Gerando...
                </span>
              ) : (
                'Gerar Bio'
              )}
            </button>
          </div>
        </div>

        {/* Resultados */}
        {bios.length > 0 && (
          <div className="max-w-2xl mx-auto mt-8 space-y-4">
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              Escolha sua bio favorita:
            </h2>
            {bios.map((bio, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-purple-500 transition-all"
              >
                <p className="text-white text-lg mb-4">{bio}</p>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">
                    {bio.length} caracteres
                  </span>
                  <button
                    onClick={() => copiarBio(index, bio)}
                    className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-medium transition-all"
                  >
                    {copied === index ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 text-gray-400">
          <p>Feito com IA por Hebert</p>
        </div>
      </div>
    </main>
  )
}
