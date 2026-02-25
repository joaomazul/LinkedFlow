import type { CommentStyleId } from './linkedin.types'
import type { CommentStyleConfig } from './ai.types'

export interface PersonaConfig {
    name: string              // nome do usuário
    role: string              // cargo/função
    company: string
    niche: string             // nicho/área de atuação
    tone: string              // tom geral (ex: "profissional mas próximo")
    goals: string             // objetivos no LinkedIn
    avoid: string             // o que evitar nos comentários
    customPrompt: string      // prompt livre para complementar
}

export interface AppSettings {
    persona: PersonaConfig
    commentStyles: CommentStyleConfig[]
    defaultStyleId: CommentStyleId
    linkedinAccountId?: string   // conta Unipile selecionada para postar
    autoRefreshInterval?: number // minutos (0 = desligado)
    showRightPanel: boolean
    language: 'pt-BR' | 'en-US' | 'es-ES'
}
