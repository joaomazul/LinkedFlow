"use client";

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('[GlobalError]', error)
    }, [error])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-lf-bg">
            <div className="max-w-md text-center space-y-6">
                <div className="w-16 h-16 bg-red-500/10 rounded-r-sm flex items-center justify-center mx-auto">
                    <AlertTriangle className="text-red-500" size={32} />
                </div>
                <div>
                    <h2 className="lf-title lf-text text-2xl">Algo deu errado!</h2>
                    <p className="lf-body text-lf-text3 mt-2">
                        Ocorreu um erro inesperado ao processar sua solicitação no sistema.
                    </p>
                </div>
                <div className="grid gap-3">
                    <Button onClick={() => reset()} className="w-full bg-lf-accent hover:bg-lf-accent2">
                        Tentar Novamente
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            localStorage.clear()
                            window.location.href = '/'
                        }}
                        className="w-full border-lf-border text-lf-text3 hover:bg-lf-s1"
                    >
                        Limpeza Profunda (Hard Reset)
                    </Button>
                </div>
            </div>
        </div>
    )
}
