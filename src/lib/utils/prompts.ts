import type { PersonaConfig } from '@/types/settings.types'

export function buildPersonaPrompt(persona: PersonaConfig): string {
    const parts: string[] = []

    if (persona.name) parts.push(`Meu nome é ${persona.name}.`)
    if (persona.role && persona.company)
        parts.push(`Sou ${persona.role} na ${persona.company}.`)
    else if (persona.role)
        parts.push(`Sou ${persona.role}.`)
    if (persona.niche)
        parts.push(`Atuo na área de ${persona.niche}.`)
    if (persona.tone)
        parts.push(`Meu tom de comunicação é ${persona.tone}.`)
    if (persona.goals)
        parts.push(`Meus objetivos no LinkedIn: ${persona.goals}.`)
    if (persona.avoid)
        parts.push(`Evito nos meus comentários: ${persona.avoid}.`)
    if (persona.customPrompt)
        parts.push(persona.customPrompt.trim())

    return parts.join(' ')
}
