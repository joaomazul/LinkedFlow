import { AlertCircle, SearchX } from 'lucide-react'

interface FeedStateProps {
    title: string
    message: string
}

export function EmptyFeedState({ title, message }: FeedStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-16 text-center rounded-lg border border-dashed border-lf-border bg-lf-s1/40 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-500">
            <div className="h-14 w-14 rounded-r-sm bg-lf-s2 border border-lf-border flex items-center justify-center text-lf-text4 mb-5 shadow-inner">
                <SearchX size={24} />
            </div>
            <h3 className="lf-subtitle lf-text text-lg">{title}</h3>
            <p className="lf-body-sm text-lf-text3 mt-2 max-w-[320px] leading-relaxed">
                {message}
            </p>
        </div>
    )
}

export function ErrorState({ title = "Ops! Algo deu errado", message }: FeedStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-16 text-center rounded-lg border border-red-500/10 bg-red-500/5 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-500">
            <div className="h-14 w-14 rounded-r-sm bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-5">
                <AlertCircle size={24} />
            </div>
            <h3 className="lf-subtitle text-red-200 text-lg">{title}</h3>
            <p className="lf-body-sm text-red-400/80 mt-2 max-w-[320px] leading-relaxed">
                {message || "Ocorreu um erro técnico ao processar sua solicitação. Verifique sua conexão ou tente novamente."}
            </p>
        </div>
    )
}
