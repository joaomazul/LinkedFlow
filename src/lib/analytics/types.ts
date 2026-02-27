export interface PeriodMetrics {
    // Posts
    postsCreated: number
    postsPublished: number
    avgScoreOverall: number | null
    bestFormat: string | null
    topPost: {
        id: string
        body: string
        format: string
        engagementRate: number
    } | null

    // Campanhas
    campaignsActive: number
    leadsCaptured: number
    leadsApproved: number
    leadsCompleted: number
    actionsExecuted: number
    conversionRate: number // %

    // Engajamento
    totalLikes: number
    totalComments: number
    totalShares: number
    avgEngagementRate: number | null

    // Taplio-inspired Additions
    chartData: { date: string; value: number }[]
    heatmapData: { day: number; hour: number; engagement: number }[]
    formatBreakdown: { format: string; percentage: number; count: number }[]
    scoreAccuracy: number | null

    // Tendência (vs período anterior)
    trend: {
        posts: number // % de variação
        leads: number
        engagement: number
    }
}

export interface BestTimesData {
    day: number // 0-6
    hour: number // 0-23
    engagement: number
}

export interface Insight {
    id: string
    type: 'best_time' | 'best_format' | 'topic_suggestion' | 'warning' | 'milestone' | 'conversion_rate' | 'ai_suggestion'
    title: string
    body: string
    data: any
    isRead: boolean
    createdAt: Date
}
