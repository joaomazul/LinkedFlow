// SERVER-ONLY: Do not import this module in client components or client hooks.
// Use console.log/console.error in client-side code instead.
import 'server-only'
import pino from 'pino'

export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    ...(process.env.NODE_ENV === 'development'
        ? {
            // Desenvolvimento: logs coloridos e legíveis no terminal
            transport: {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'SYS:HH:MM:ss', // horário local (SP)
                    ignore: 'pid,hostname',
                },
            },
        }
        : {
            // Produção: JSON estruturado para Vercel/Datadog/CloudWatch
            formatters: {
                level: (label: string) => ({ level: label }),
            },
            timestamp: () => `,"time":"${new Date().toISOString()}"`,
        }),
})

// Logger com contexto de módulo — use em vez do logger raiz quando possível
export function createLogger(module: string) {
    return logger.child({ module })
}
