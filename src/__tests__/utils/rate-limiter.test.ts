import { checkRateLimit } from '@/lib/rate-limiter'

describe('Rate Limiter', () => {
    it('permite requisições dentro do limite', async () => {
        const res1 = await checkRateLimit('test_user', 2, 60000)
        expect(res1.success).toBe(true)

        const res2 = await checkRateLimit('test_user', 2, 60000)
        expect(res2.success).toBe(true)

        // Terceiro excede o limite (2 maximo)
        const res3 = await checkRateLimit('test_user', 2, 60000)
        expect(res3.success).toBe(false)
        expect(res3.remaining).toBe(0)
    })
})
