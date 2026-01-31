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

    // Usando xAI (Grok)
    const apiKey = process.env.XAI_API_KEY || process.env.XAI_KEY

    if (!apiKey) {
      console.error('API Key não configurada')
      return NextResponse.json({ error: 'API não configurada' }, { status: 500 })
    }

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'grok-2-latest',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Erro xAI:', error)
      return NextResponse.json({ error: 'Erro ao gerar bio' }, { status: 500 })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

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
