import { db } from '@/db'
import { postTemplates, GeneratedPost } from '@/db/schema/posts'
import { openrouterChat } from '@/lib/openrouter/client'
import { eq } from 'drizzle-orm'
import { createLogger } from '@/lib/logger'
import { env } from '@/env'

const log = createLogger('posts/generate')

interface GeneratePostOptions {
    userId: string
    templateId: string
    inputContent: string
    inputType: 'idea' | 'article_url' | 'article_text'
    personaContext?: string
    brandVoiceSnapshot?: string
    objective?: string
    icp?: string
}

export async function generatePost(options: GeneratePostOptions) {
    log.info({ userId: options.userId, templateId: options.templateId }, 'Generating post')

    // 1. Busca o template
    const [template] = await db.select().from(postTemplates).where(eq(postTemplates.id, options.templateId)).limit(1)
    if (!template) throw new Error('Template não encontrado')

    // 2. Monta os prompts
    const systemPrompt = `${template.systemPrompt}
  
CONTEXTO DA PERSONA DO USUÁRIO:
${options.personaContext || 'Especialista em LinkedIn.'}

ESTILO DE ESCRITA (BRAND VOICE):
${options.brandVoiceSnapshot || 'Tom profissional e direto.'}`

    const userPrompt = template.userPromptTemplate
        .replace('{input_content}', options.inputContent)
        .replace('{objective}', options.objective || 'engajamento')
        .replace('{icp}', options.icp || 'público geral do LinkedIn')
        .replace('{tone}', 'conforme estilo de escrita definido')

    // 3. Chama a IA
    try {
        const response = await openrouterChat({
            model: env.OPENROUTER_MODEL,
            max_tokens: 1500,
            temperature: 0.7,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
        })

        const content = response.choices[0].message.content

        log.info({ userId: options.userId }, 'Post generated successfully')

        return {
            content,
            model: response.model,
            usage: response.usage
        }
    } catch (err) {
        log.error({ userId: options.userId, err: (err as Error).message }, 'Error in generation')
        throw err
    }
}
