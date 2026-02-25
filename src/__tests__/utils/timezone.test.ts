import { formatFullDate, nowIso } from '@/lib/utils/format'

describe('Timezone São Paulo', () => {
    it('formata datas no horário de SP', () => {
        // UTC 12:00 = SP 09:00 (UTC-3)
        const utcNoon = '2025-06-15T12:00:00.000Z'
        expect(formatFullDate(utcNoon)).toContain('09h00')
    })

    it('nowIso() retorna UTC (não local)', () => {
        const iso = nowIso()
        expect(iso).toMatch(/Z$/) // deve terminar em Z (UTC)
    })
})
