import { openrouterChat, OPENROUTER_MODEL } from './client'
import type {
    GenerateCommentRequest,
    GenerateCommentResponse,
    GeneratedCommentOption,
} from '@/types/ai.types'

export async function generateComment(
    req: GenerateCommentRequest
): Promise<GenerateCommentResponse> {
    const count = req.count ?? 3

    // ── System prompt: combina persona do usuário + instrução base ──
    const systemPrompt = buildSystemPrompt(req.personaPrompt)

    // ── User prompt: post + estilo + quantidade ──
    const userPrompt = buildUserPrompt(req, count)

    const response = await openrouterChat({
        model: OPENROUTER_MODEL,
        max_tokens: 1200,
        temperature: 0.85,           // criatividade alta para variedade entre opções
        response_format: { type: 'json_object' },
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
    })

    const raw = response.choices[0]?.message?.content ?? ''

    let parsed: { comentarios: Array<{ tag: string; texto: string }> }
    try {
        const clean = raw.replace(/```json|```/g, '').trim()
        parsed = JSON.parse(clean)
    } catch {
        throw new Error(`[OpenRouter] Resposta não é JSON válido: ${raw.slice(0, 200)}`)
    }

    const options: GeneratedCommentOption[] = parsed.comentarios.map((c, i) => ({
        id: `opt_${i}_${Date.now()}`,
        label: c.tag,
        text: c.texto,
    }))

    return {
        options,
        styleId: req.styleId,
        model: response.model ?? OPENROUTER_MODEL,
        usage: response.usage,
    }
}

// ── Builders de prompt ──────────────────────────────────────────────────────

function buildSystemPrompt(personaPrompt: string): string {
    const base = `Você é um especialista em comunicação e networking profissional no LinkedIn.
Sua função é gerar comentários autênticos, humanos e estratégicos para posts do LinkedIn.

REGRAS ABSOLUTAS:
- NUNCA seja genérico, corporativo demais ou artificial
- NUNCA comece com "Ótimo post!", "Que conteúdo incrível!" ou similares
- SEMPRE varie a abertura de cada opção gerada
- SEMPRE escreva em português brasileiro natural, não formal demais
- Os comentários devem parecer escritos por uma pessoa real que leu o post com atenção
- Cada opção deve ter uma abordagem, estrutura e abertura completamente diferente das outras
- Tamanho: entre 30 e 130 palavras por comentário (nem muito curto, nem muito longo)
- Responda EXCLUSIVAMENTE em JSON válido, sem markdown, sem explicações externas`

    if (!personaPrompt?.trim()) return base

    return `${base}

PERFIL E CONTEXTO DE QUEM VAI COMENTAR:
${personaPrompt.trim()}

Use esse contexto para tornar os comentários mais autênticos e alinhados com quem a pessoa é. Quando relevante, conecte a perspectiva dela ao tema do post.`
}

function buildUserPrompt(req: GenerateCommentRequest, count: number): string {
    return `O post do LinkedIn ao qual você deve reagir está delimitado pelas tags <post> e </post>.
Autor do Post: ${req.postAuthor}${req.postAuthorRole ? ` (${req.postAuthorRole})` : ''}

<post>
${req.postText}
</post>

INSTRUÇÃO DE ESTILO (Como você deve responder):
${req.stylePrompt}

TAREFA:
Gere exatamente ${count} comentários diferentes para o post acima, seguindo rigorosamente o estilo indicado.
Cada comentário deve ser único: varie a abertura, a estrutura e o ângulo de abordagem.

Responda APENAS neste formato JSON, sem nada antes ou depois:
{
  "comentarios": [
    { "tag": "Opção 1", "texto": "..." },
    { "tag": "Opção 2", "texto": "..." },
    { "tag": "Opção 3", "texto": "..." }
  ]
}`
}
