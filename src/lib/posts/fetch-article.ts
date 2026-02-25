import { createLogger } from '@/lib/logger'

const log = createLogger('posts/fetch-article')

export async function fetchArticleContent(url: string): Promise<string> {
    log.info({ url }, 'Fetching article content')

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            next: { revalidate: 3600 } // Cache por 1 hora
        })

        if (!response.ok) {
            throw new Error(`Falha ao carregar artigo: ${response.statusText}`)
        }

        const html = await response.text()

        // Limpeza básica de HTML (remove scripts, links, styles, tags)
        // Em um cenário real, usaríamos uma lib como 'jsdom' + '@mozilla/readability'
        // Mas para manter as regras de isolamento e simplicidade inicial, usaremos regex básico
        // e extrairemos o que parecer conteúdo principal.

        let text = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()

        // Corta metadados excessivos de cabeçalho/rodapé se possível, ou apenas limita o tamanho
        // para não estourar o contexto da IA.
        if (text.length > 10000) {
            text = text.slice(0, 10000) + '...'
        }

        log.info({ url, length: text.length }, 'Article content fetched')
        return text
    } catch (err) {
        log.error({ url, err: (err as Error).message }, 'Error fetching article')
        throw err
    }
}
