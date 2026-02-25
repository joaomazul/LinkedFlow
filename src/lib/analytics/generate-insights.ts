import { db } from '@/db'
import { engagementInsights } from '@/db/schema'
import { openrouterChat, OPENROUTER_MODEL } from '@/lib/openrouter/client'
import { PeriodMetrics } from './types'

export async function generateWeeklyInsights(
    userId: string,
    metrics: PeriodMetrics
): Promise<void> {
    const insights: Array<any> = []
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias

    // Insight 1: melhor formato
    if (metrics.bestFormat) {
        insights.push({
            userId,
            insightType: 'best_format',
            title: `Seu formato com melhor desempenho: ${metrics.bestFormat}`,
            body: `Posts no formato "${metrics.bestFormat}" tiveram ${metrics.avgScoreOverall || 0} de score médio nos últimos 30 dias. Continue apostando neste formato.`,
            data: { format: metrics.bestFormat, avgScore: metrics.avgScoreOverall },
            expiresAt,
        })
    }

    // Insight 2: taxa de conversão de leads
    if (metrics.leadsCaptured > 0) {
        const rate = Math.round(metrics.conversionRate)
        const benchmarkMsg = rate >= 30 ? 'acima da média do mercado (25%)' : 'abaixo da média — revise os templates de DM'
        insights.push({
            userId,
            insightType: 'conversion_rate',
            title: `Taxa de conversão: ${rate}%`,
            body: `De ${metrics.leadsCaptured} leads capturados, ${metrics.leadsCompleted} foram concluídos (${rate}%). Isso está ${benchmarkMsg}.`,
            data: { captured: metrics.leadsCaptured, completed: metrics.leadsCompleted, rate },
            expiresAt,
        })
    }

    // Insight 3: IA analisa dados e sugere próxima ação
    if (metrics.postsPublished >= 1) {
        const aiInsight = await generateAIInsight(metrics)
        if (aiInsight) {
            insights.push({
                userId,
                insightType: 'ai_suggestion',
                title: aiInsight.title,
                body: aiInsight.body,
                data: {},
                expiresAt
            })
        }
    }

    // Salvar insights
    for (const insight of insights) {
        await db.insert(engagementInsights).values(insight)
    }
}

async function generateAIInsight(metrics: PeriodMetrics): Promise<{ title: string; body: string } | null> {
    const prompt = `Com base nestes dados de um usuário do LinkedIn nos últimos 30 dias:
- Posts publicados: ${metrics.postsPublished}
- Leads capturados: ${metrics.leadsCaptured}
- Taxa de conversão: ${metrics.conversionRate}%
- Score médio de posts: ${metrics.avgScoreOverall}
- Melhor formato: ${metrics.bestFormat}

Gere 1 insight acionável e específico para melhorar o engajamento ou as vendas. 
Responda APENAS um JSON válido no formato:
{ "title": "título curto (máx 60 chars)", "body": "insight em 2 frases com sugestão concreta" }`

    try {
        const response = await openrouterChat({
            model: OPENROUTER_MODEL,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' }
        })

        const content = response.choices[0]?.message?.content
        if (content) {
            return JSON.parse(content)
        }
    } catch (error) {
        console.error('[generate-insights] Erro OpenRouter:', error)
    }

    return null
}
