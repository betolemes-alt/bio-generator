import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { profissao, palavras, plataforma } = await request.json()

    if (!profissao) {
      return NextResponse.json({ error: 'Profissao obrigatoria' }, { status: 400 })
    }

    // Limites por plataforma
    const limites: Record<string, number> = {
      instagram: 150,
      linkedin: 220,
      twitter: 160
    }

    const limite = limites[plataforma] || 150

    const prompt = `Voce e um especialista em criar bios profissionais para redes sociais.

Crie 5 bios criativas e profissionais para ${plataforma.toUpperCase()} com as seguintes informacoes:
- Profissao: ${profissao}
${palavras ? `- Palavras-chave: ${palavras}` : ''}

Regras:
- Cada bio deve ter no MAXIMO ${limite} caracteres
- Seja criativo e use emojis relevantes
- Inclua um call-to-action sutil quando possivel
- Varie o estilo entre as 5 opcoes (formal, descontraido, inspirador, direto, criativo)
- Escreva em portugues brasileiro

Retorne APENAS as 5 bios, uma por linha, sem numeracao ou explicacoes.`

    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      console.error('API Key não configurada')
      return NextResponse.json({ error: 'API não configurada' }, { status: 500 })
    }

    // Usando Claude (Anthropic)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Erro Claude:', error)
      return NextResponse.json({ error: 'Erro ao gerar bio' }, { status: 500 })
    }

    const data = await response.json()
    const content = data.content?.[0]?.text || ''

    // Separar as bios por linha
    const bios = content
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 10)
      .slice(0, 5)

    return NextResponse.json({ bios })

  } catch (error) {
    console.error('Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
