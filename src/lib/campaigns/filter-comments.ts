/**
 * Filtra comentários capturados e calcula score de intenção.
 * Completamente isolado — sem dependências externas além dos tipos.
 */

import type { CaptureMode } from './types'

// Palavras de alta intenção (PT + EN)
const HIGH_INTENT_WORDS = [
    'quero', 'preciso', 'interesse', 'interessado', 'interessante',
    'como funciona', 'como faço', 'como posso', 'me envia', 'manda',
    'eu quero', 'tenho interesse', 'me manda', 'compartilha',
    'want', 'need', 'interested', 'how', 'send me', 'share', 'link',
    'material', 'conteúdo', 'curso', 'mentoria', 'consultoria', 'preço',
    'valor', 'quanto custa', 'disponível', 'acesso', 'download'
]

function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove acentos
        .replace(/[^a-z0-9\s]/g, ' ')
        .trim()
}

export function calculateIntentScore(commentText: string): number {
    const normalized = normalizeText(commentText)
    let score = 30 // base

    // Comprimento do comentário
    const wordCount = normalized.split(/\s+/).length
    if (wordCount >= 10) score += 15
    if (wordCount >= 20) score += 10

    // Palavras de alta intenção
    const matchedWords = HIGH_INTENT_WORDS.filter(w => normalized.includes(w))
    score += Math.min(matchedWords.length * 10, 40)

    // Pergunta direta
    if (commentText.includes('?')) score += 10

    // Emoji de like/fire/coração (engajamento positivo)
    // Nota: Regex simples para emojis comuns de engajamento
    if (/[❤️🔥👏✅💡🚀]/.test(commentText)) score += 5

    return Math.min(score, 100)
}

export function filterComment(
    commentText: string,
    captureMode: CaptureMode,
    keywords: string[] | null | unknown
): { shouldCapture: boolean; keywordMatched?: string } {
    const normalized = normalizeText(commentText)
    const safeKeywords = Array.isArray(keywords) ? (keywords as string[]) : []

    // Ignorar comentários muito curtos ou vazios
    const wordCount = normalized.split(/\s+/).filter(Boolean).length
    if (wordCount < 1) {
        return { shouldCapture: false }
    }

    if (captureMode === 'any') {
        return { shouldCapture: true }
    }

    // Modo keyword: verificar se alguma keyword está presente
    for (const keyword of safeKeywords) {
        const normalizedKeyword = normalizeText(keyword)
        if (normalized.includes(normalizedKeyword)) {
            return { shouldCapture: true, keywordMatched: keyword }
        }
    }

    return { shouldCapture: false }
}
