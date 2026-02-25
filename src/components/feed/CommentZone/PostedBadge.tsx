'use client'

import { CheckCircle2, RotateCcw } from 'lucide-react'

export function PostedBadge({ onReset }: { onReset: () => void }) {
    return (
        <div className="flex items-center justify-between rounded-lg
                    bg-green-500/10 border border-green-500/20 px-4 py-3">
            <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    Comentário publicado no LinkedIn!
                </span>
            </div>
            <button
                onClick={onReset}
                className="flex items-center gap-1.5 text-xs text-muted-foreground
                   hover:text-foreground transition-colors"
                title="Comentar novamente"
            >
                <RotateCcw className="h-3 w-3" />
                Novo
            </button>
        </div>
    )
}
