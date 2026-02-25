import { validateCommentText } from '@/lib/linkedin/limits'

describe('LinkedIn Limits Validation', () => {
    it('rejeita comentário vazio', () => {
        const res = validateCommentText('   ')
        expect(res.valid).toBe(false)
        expect(res.error).toContain('vazio')
    })

    it('aceita comentário válido', () => {
        const res = validateCommentText('Ótimo artigo, concordo plenamente!')
        expect(res.valid).toBe(true)
    })

    it('rejeita comentário muito longo excedendo 1250 chars', () => {
        const longText = 'a'.repeat(1300)
        const res = validateCommentText(longText)
        expect(res.valid).toBe(false)
        expect(res.error).toContain('excede o limite')
    })
})
