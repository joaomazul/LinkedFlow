import { db } from '@/db'
import { brandVoiceCache } from '@/db/schema/posts'
import { eq } from 'drizzle-orm'
import { fetchUserPosts } from '@/lib/unipile/profiles'
import { openrouterChat } from '@/lib/openrouter/client'
import { createLogger } from '@/lib/logger'
import { env } from '@/env'

const log = createLogger('posts/analyze-voice')

export async function analyzeBrandVoice(userId: string, linkedinAccountId: string, linkedinProfileId: string) {
    log.info({ userId }, 'Starting brand voice analysis')

    try {
        // 1. Busca os posts recentes do usuário via Unipile
        const { posts } = await fetchUserPosts(linkedinProfileId, { limit: 15 })

        if (!posts || posts.length === 0) {
            log.warn({ userId }, 'No posts found for analysis')
            return null
        }

        // Filtra posts que são apenas reposts sem comentário
        const organicPosts = posts.filter(p => !p.isRepost || (p.text && p.text.length > 50))
        const sampleText = organicPosts.map(p => p.text).join('\n---\n')

        // 2. IA analisa o estilo
        const analysis = await callAIBrandVoiceAnalysis(sampleText)

        // 3. Salva/Atualiza o cache
        const result = await db.insert(brandVoiceCache).values({
            userId,
            writingStyle: analysis.writingStyle,
            toneAdjectives: analysis.toneAdjectives,
            recurringTopics: analysis.recurringTopics,
            avgPostLength: Math.round(organicPosts.reduce((acc, p) => acc + p.text.length, 0) / organicPosts.length),
            usesEmojis: organicPosts.some(p => /[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(p.text)),
            postsAnalyzed: organicPosts.length,
            lastAnalyzedAt: new Date(),
            lastPostId: organicPosts[0].id,
        }).onConflictDoUpdate({
            target: brandVoiceCache.userId,
            set: {
                writingStyle: analysis.writingStyle,
                toneAdjectives: analysis.toneAdjectives,
                recurringTopics: analysis.recurringTopics,
                postsAnalyzed: organicPosts.length,
                lastAnalyzedAt: new Date(),
                updatedAt: new Date(),
            }
        }).returning()

        log.info({ userId }, 'Brand voice analysis complete')
        return result[0]
    } catch (err) {
        log.error({ userId, err: (err as Error).message }, 'Error in brand voice analysis')
        throw err
    }
}

async function callAIBrandVoiceAnalysis(postsText: string) {
    const systemPrompt = `Você é um linguista computacional especialista em análise de estilo de escrita (Brand Voice).
Sua tarefa é analisar uma amostra de posts do LinkedIn de um usuário e extrair seu DNA de escrita.`

    const userPrompt = `Abaixo estão os posts recentes de um usuário do LinkedIn. 
Analise-os e extraia o estilo, tom e tópicos.

POSTS:
${postsText.slice(0, 15000)}

Responda APENAS em JSON válido:
{
  "writingStyle": "descrição detalhada do estilo (ex: frases curtas, uso de listas, chamadas diretas)",
  "toneAdjectives": ["adjetivo1", "adjetivo2", "adjetivo3"],
  "recurringTopics": ["tópico1", "tópico2"]
}`

    const response = await openrouterChat({
        model: env.OPENROUTER_MODEL,
        response_format: { type: 'json_object' },
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
    })

    return JSON.parse(response.choices[0].message.content)
}
