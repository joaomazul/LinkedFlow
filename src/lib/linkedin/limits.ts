import { env } from '@/env'

// Dicionário em memória: profileId -> lastCommentTimestamp
const lastCommentTimes = new Map<string, number>()

export function validateCommentText(text: string): { valid: boolean; error?: string } {
    const MAX_LENGTH = env.LINKEDIN_MAX_COMMENT_LENGTH || 1250

    if (!text || text.trim() === '') {
        return { valid: false, error: 'O comentário não pode ser vazio.' }
    }

    if (text.length > MAX_LENGTH) {
        return { valid: false, error: `O comentário excede o limite do LinkedIn de ${MAX_LENGTH} caracteres (atual: ${text.length}).` }
    }

    return { valid: true }
}

export async function enforceCommentDelay(profileId: string): Promise<void> {
    const MIN_DELAY_MS = (env.LINKEDIN_MIN_COMMENT_DELAY_SECONDS || 30) * 1000
    const now = Date.now()
    const lastTime = lastCommentTimes.get(profileId) || 0

    const timeSinceLast = now - lastTime
    if (timeSinceLast < MIN_DELAY_MS) {
        const waitMs = MIN_DELAY_MS - timeSinceLast
        throw new Error(`Muitos comentários em sequência. Aguarde ${Math.ceil(waitMs / 1000)}s antes de enviar outro.`)
    }

    lastCommentTimes.set(profileId, now)
}
