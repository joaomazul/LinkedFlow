import { openrouterChat, OPENROUTER_MODEL } from '@/lib/openrouter/client'

interface GenerateInput {
    campaignName: string
    postText: string
    commentText: string
    leadName: string
    leadHeadline?: string | null
    personaPrompt?: string | null
    replyTemplate?: string | null
    dmTemplate?: string | null
    leadMagnetUrl?: string | null
    leadMagnetLabel?: string | null
}

interface GeneratedContent {
    reply: string
    dm: string
}

export async function generateCampaignContent(
    input: GenerateInput
): Promise<GeneratedContent> {
    const systemPrompt = buildCampaignSystemPrompt(input.personaPrompt)
    const userPrompt = buildCampaignUserPrompt(input)

    const response = await openrouterChat({
        model: OPENROUTER_MODEL,
        max_tokens: 1000,
        temperature: 0.7,
        response_format: { type: 'json_object' },
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
    })

    const raw = response.choices[0]?.message?.content ?? ''

    try {
        const clean = raw.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(clean)
        return {
            reply: parsed.reply || '',
            dm: parsed.dm || ''
        }
    } catch (err) {
        console.error('[generate-campaign-content] Erro ao parsear JSON da IA:', raw)
        throw new Error('Falha ao gerar conteúdo da campanha via IA.')
    }
}

function buildCampaignSystemPrompt(personaPrompt?: string | null): string {
    const base = `Você é um especialista em social selling e networking estratégico no LinkedIn.
Sua tarefa é gerar uma resposta a um comentário e uma mensagem direta (DM) personalizada.

REGRAS:
1. Responda ao comentário de forma pública, agradecendo e gerando curiosidade.
2. Na DM, seja pessoal, mencione o comentário dele e entregue o valor (lead magnet) se disponível.
3. Se houver um template, use-o como base mas personalize com o nome do lead e contexto.
4. Mantenha tom humano, profissional e direto. NUNCA use "espero que esta mensagem o encontre bem".
5. Responda EXCLUSIVAMENTE em JSON: { "reply": "...", "dm": "..." }`

    if (!personaPrompt) return base
    return `${base}\n\nCONTEXTO DO USUÁRIO (Sua Persona):\n${personaPrompt}`
}

function buildCampaignUserPrompt(input: GenerateInput): string {
    const safeCommentText = (input.commentText ?? '')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
        .slice(0, 500)

    const safeProfileName = (input.leadName ?? 'Usuário')
        .replace(/[<>{}|\`]/g, '')
        .trim()
        .slice(0, 100)

    const safePostText = (input.postText ?? '')
        .trim()
        .slice(0, 800)

    return `CONTEXTO DA CAMPANHA: ${input.campaignName}
POST ORIGINAL: "${safePostText.slice(0, 500)}..."
LEAD: ${safeProfileName} ${input.leadHeadline ? `(${input.leadHeadline})` : ''}
COMENTÁRIO DO LEAD: "${safeCommentText}"

${input.leadMagnetUrl ? `LEAD MAGNET DISPONÍVEL: ${input.leadMagnetLabel} (${input.leadMagnetUrl})` : ''}

${input.replyTemplate ? `TEMPLATE DE RESPOSTA: ${input.replyTemplate}` : ''}
${input.dmTemplate ? `TEMPLATE DE DM: ${input.dmTemplate}` : ''}

TAREFA:
1. Gere uma resposta (Reply) ao comentário do lead.
2. Gere uma mensagem direta (DM) para enviar ao lead.
3. Se houver Lead Magnet, inclua o link na DM de forma natural.`
}
