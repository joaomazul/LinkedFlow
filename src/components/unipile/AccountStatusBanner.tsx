'use client'

import { useQuery } from '@tanstack/react-query'
import { AlertCircle } from 'lucide-react'

export function AccountStatusBanner() {
    const { data } = useQuery({
        queryKey: ['unipile-account-status'],
        queryFn: async () => {
            const res = await fetch('/api/linkedin/account-status')
            if (!res.ok) throw new Error()
            return res.json()
        },
        refetchInterval: 1000 * 60 * 5, // A cada 5min
    })

    if (!data || data.status === 'OK' || data.status === 'NO_ACCOUNT') return null

    return (
        <div className="bg-red-500/10 border-l-4 border-red-500 p-4 mb-6 rounded-r-md flex items-start gap-3 shadow-sm mx-6 mt-6">
            <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={18} />
            <div>
                <h4 className="text-red-500 font-semibold text-[14px]">Problema de Conexão com LinkedIn</h4>
                <p className="text-red-400/90 text-sm mt-1 leading-relaxed">
                    {data.status === 'DISCONNECTED' || data.status === 'ERROR'
                        ? 'Sua conta foi desconectada por segurança ou a sessão expirou. Vá em Configurações para reconectar e continuar usando a automação.'
                        : 'Estamos com dificuldades para nos comunicar com o LinkedIn. Verifique sua conexão ou tente mais tarde.'}
                </p>
            </div>
        </div>
    )
}
