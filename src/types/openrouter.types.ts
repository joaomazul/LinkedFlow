export interface OpenRouterMessage {
    role: 'system' | 'user' | 'assistant'
    content: string
}

export interface OpenRouterRequest {
    model: string
    messages: OpenRouterMessage[]
    max_tokens?: number
    temperature?: number
    response_format?: { type: 'json_object' }
    stream?: boolean
}

export interface OpenRouterChoice {
    index: number
    message: {
        role: 'assistant'
        content: string
    }
    finish_reason: 'stop' | 'length' | 'content_filter'
}

export interface OpenRouterResponse {
    id: string
    model: string
    created: number
    choices: OpenRouterChoice[]
    usage: {
        prompt_tokens: number
        completion_tokens: number
        total_tokens: number
    }
}

export interface OpenRouterError {
    error: {
        message: string
        code: number
        metadata?: Record<string, unknown>
    }
}
