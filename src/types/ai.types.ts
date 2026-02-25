import type { CommentStyleId } from './linkedin.types'

export interface CommentStyle {
    id: CommentStyleId
    label: string
    icon: string
    description: string
    systemPromptFragment: string  // instrução específica do estilo
    isCustom?: boolean
}

// Configuração editável de um estilo de comentário
export interface CommentStyleConfig {
    id: CommentStyleId
    label: string
    icon: string
    description: string           // descrição para o usuário
    prompt: string                // prompt completo, editável pelo usuário
    active: boolean
    order: number
}

// Geração de comentários
export interface GenerateCommentRequest {
    postText: string
    postAuthor: string
    postAuthorRole?: string
    styleId: CommentStyleId
    stylePrompt: string
    personaPrompt: string         // o "person prompt" do usuário
    count?: number                // quantas opções gerar (default: 3)
}

export interface GeneratedCommentOption {
    id: string
    label: string                 // "Opção 1", "Opção 2"...
    text: string
    tone?: string                 // descrição interna do tom usado
}

export interface GenerateCommentResponse {
    commentId?: string
    options: GeneratedCommentOption[]
    styleId: CommentStyleId
    model: string
    usage?: {
        prompt_tokens: number
        completion_tokens: number
        total_tokens: number
    }
}
