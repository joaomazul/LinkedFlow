const rateLimits = new Map<string, { count: number; expiresAt: number }>()

// Cleanup periodico das chaves expiradas a cada minuto
setInterval(() => {
    const now = Date.now()
    for (const [key, record] of rateLimits.entries()) {
        if (record.expiresAt < now) rateLimits.delete(key)
    }
}, 60000)


export async function checkRateLimit(
    key: string,
    limit: number,
    windowMs: number
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    const now = Date.now()
    const record = rateLimits.get(key)

    if (!record || record.expiresAt < now) {
        rateLimits.set(key, { count: 1, expiresAt: now + windowMs })
        return { success: true, limit, remaining: limit - 1, reset: now + windowMs }
    }

    if (record.count >= limit) {
        return { success: false, limit, remaining: 0, reset: record.expiresAt }
    }

    record.count += 1
    return { success: true, limit, remaining: limit - record.count, reset: record.expiresAt }
}
