import { getAuthenticatedUserId } from '@/lib/auth/user'
import { db } from '@/db'
import { generatedPosts, brandVoiceCache, postTemplates } from '@/db/schema/posts'
import { personas } from '@/db/schema/personas'
import { eq, and, desc } from 'drizzle-orm'
import { success, apiError } from '@/lib/utils/api-response'
import { generatePost } from '@/lib/posts/generate-post'
import { scorePost } from '@/lib/posts/score-post'
import { fetchArticleContent } from '@/lib/posts/fetch-article'
import { checkRateLimit } from '@/lib/rate-limiter'
import { createLogger } from '@/lib/logger'
import { z } from 'zod'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
const log = createLogger('api/posts')

const GenerateSchema = z.object({
    templateId: z.string().uuid(),
    inputType: z.enum(['idea', 'article_url', 'article_text']),
    inputContent: z.string().min(1),
    objective: z.string().optional(),
    icp: z.string().optional(),
})

export async function GET(req: Request) {
    try {
        const userId = await getAuthenticatedUserId()
        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status') || 'draft'

        log.info({ userId, status }, '[posts] GET started')
        const posts = await db.select()
            .from(generatedPosts)
            .where(and(eq(generatedPosts.userId, userId), eq(generatedPosts.status, status)))
            .orderBy(desc(generatedPosts.createdAt))

        log.info({ userId, count: posts.length }, '[posts] GET complete')
        return success(posts)
    } catch (error) {
        log.error({ err: (error as Error).message }, '[posts] GET FAILED')
        return apiError('Erro ao buscar posts', 500)
    }
}

export async function POST(req: Request) {
    try {
        const userId = await getAuthenticatedUserId()
        log.info({ userId }, '[posts] POST — generating new post')

        // Rate limit: 20 gerações por minuto por usuário
        const limit = await checkRateLimit(`ai:post:${userId}`, 20, 60000)
        if (!limit.success) {
            const resetInSeconds = Math.ceil((limit.reset - Date.now()) / 1000)
            log.warn({ userId, resetInSeconds }, '[posts] Rate limit hit')
            return apiError(
                `Muitas gerações de post. Aguarde ${resetInSeconds}s`,
                429,
                'RATE_LIMIT'
            )
        }

        const body = await req.json()

        const parsed = GenerateSchema.safeParse(body)
        if (!parsed.success) {
            log.warn({ userId, errors: parsed.error.issues }, '[posts] Invalid input')
            return apiError('Dados inválidos', 400)
        }

        const { templateId, inputType, inputContent, objective, icp } = parsed.data
        log.info({ userId, templateId, inputType, contentLen: inputContent.length }, '[posts] Generating')

        // 1. Resolve conteúdo se for URL
        let finalContent = inputContent
        if (inputType === 'article_url') {
            finalContent = await fetchArticleContent(inputContent)
            log.info({ userId, articleLen: finalContent.length }, '[posts] Article content fetched')
        }

        // 2. Busca contextos (Persona + Brand Voice)
        const [[persona], [brandVoice]] = await Promise.all([
            db.select().from(personas).where(and(eq(personas.userId, userId), eq(personas.isActive, 'true'))).limit(1),
            db.select().from(brandVoiceCache).where(eq(brandVoiceCache.userId, userId)).limit(1)
        ])

        // 3. Gera o post
        const t0 = Date.now()
        const generation = await generatePost({
            userId,
            templateId,
            inputContent: finalContent,
            inputType,
            personaContext: persona?.compiledPrompt || undefined,
            brandVoiceSnapshot: brandVoice?.writingStyle || undefined,
            objective,
            icp
        })
        log.info({ userId, model: generation.model, ms: Date.now() - t0 }, '[posts] AI generation complete')

        // 4. Score automático opcional
        const scoring = await scorePost(generation.content)
        log.info({ userId, score: scoring.overall }, '[posts] Post scored')

        // 5. Salva como rascunho
        const [newPost] = await db.insert(generatedPosts).values({
            userId,
            inputType,
            inputContent: finalContent,
            inputUrl: inputType === 'article_url' ? inputContent : null,
            format: 'short', // Ajustar para pegar do template
            body: generation.content,
            scoreOverall: scoring.overall,
            scoreHook: scoring.hook,
            scoreDepth: scoring.depth,
            scoreClarity: scoring.clarity,
            scoreEngagementPrediction: scoring.engagement,
            scoreFeedback: scoring.feedback,
            brandVoiceSnapshot: brandVoice?.writingStyle,
            generationModel: generation.model,
            status: 'draft'
        }).returning()

        log.info({ userId, postId: newPost.id }, '[posts] Draft saved')
        return success(newPost)
    } catch (error) {
        log.error({ err: (error as Error).message, stack: (error as Error).stack?.slice(0, 300) }, '[posts] POST FAILED')
        return apiError('Erro ao gerar post', 500)
    }
}
