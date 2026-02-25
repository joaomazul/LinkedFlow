import { env } from '@/env'
import { openrouterChat } from '@/lib/openrouter/client'
import { createLogger } from '@/lib/logger'

const log = createLogger('posts/score')

export async function scorePost(content: string) {
    log.info('Scoring post')

    const systemPrompt = `Você é um especialista em performance no LinkedIn. 
Sua tarefa é avaliar um post e dar notas de 0 a 100 para dimensões específicas.`

    const userPrompt = `Avalie o seguinte post do LinkedIn:

CONTÉUDO:
${content}

Responda APENAS em JSON válido:
{
  "hook": 85,
  "depth": 70,
  "clarity": 90,
  "engagement": 75,
  "overall": 80,
  "feedback": "O gancho é forte, mas o desenvolvimento poderia ter mais dados para aumentar a autoridade."
}`

    try {
        const response = await openrouterChat({
            model: env.OPENROUTER_MODEL,
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
        })

        return JSON.parse(response.choices[0].message.content)
    } catch (err) {
        log.error({ err: (err as Error).message }, 'Error in scoring')
        return {
            hook: 0, depth: 0, clarity: 0, engagement: 0, overall: 0,
            feedback: 'Não foi possível avaliar o post no momento.'
        }
    }
}
