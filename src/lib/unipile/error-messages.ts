export function getUnipileFriendlyError(errorObjectOrString: unknown): string {
    const errorMsg = String(errorObjectOrString).toLowerCase()
    if (!errorMsg) return 'Ocorreu um erro inesperado ao conectar ao LinkedIn.'

    if (errorMsg.includes('timeout') || errorMsg.includes('abort') || errorMsg.includes('tempo limite')) {
        return 'O LinkedIn (ou a API) demorou muito para responder. Tente novamente.'
    }
    if (errorMsg.includes('account disconnected') || errorMsg.includes('checkpoint') || errorMsg.includes('unauthorized')) {
        return 'Sua conta do LinkedIn foi desconectada por segurança (ou sessão expirada). Reautentique.'
    }
    if (errorMsg.includes('rate limit') || errorMsg.includes('429')) {
        return 'Limite de requisições do LinkedIn atingido. Tente mais tarde.'
    }
    if (errorMsg.includes('not found') || errorMsg.includes('404')) {
        return 'Recurso não encontrado no LinkedIn. A postagem ou perfil pode não ser público ou foi removido.'
    }

    return 'Ocorreu um erro ao processar sua solicitação no LinkedIn (API).'
}
