export function success<T>(data: T, status = 200) {
    return Response.json({ ok: true, data }, { status })
}

export function apiError(
    message: string,
    status = 500,
    code = 'ERROR'
) {
    return Response.json({ ok: false, error: { message, code } }, { status })
}

export const createApiResponse = {
    success,
    error: apiError,
    unauthorized: () => apiError('Não autorizado', 401, 'UNAUTHORIZED'),
    forbidden: () => apiError('Acesso negado', 403, 'FORBIDDEN'),
    notFound: (msg = 'Não encontrado') => apiError(msg, 404, 'NOT_FOUND'),
    badRequest: (msg = 'Requisição inválida') => apiError(msg, 400, 'BAD_REQUEST'),
}
