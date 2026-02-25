import React from 'react'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'
import { RefreshCw, Menu } from 'lucide-react'

interface TopbarProps {
    title: string
    badge?: string
    children?: React.ReactNode
    onMenuClick?: () => void
}

export function Topbar({ title, badge, children, onMenuClick }: TopbarProps) {
    const { isEnabled, formattedTime } = useAutoRefresh()

    return (
        <header className="h-[60px] bg-lf-s1 border-b border-lf-border flex items-center px-4 md:px-6 gap-4 shrink-0 sticky top-0 z-50">
            <button
                onClick={onMenuClick}
                className="lg:hidden p-2 text-lf-text3 hover:text-lf-text hover:bg-lf-s2 rounded-lg transition-colors"
            >
                <Menu size={20} />
            </button>

            <div className="flex items-center">
                <h1 className="lf-title lf-text text-lg md:text-xl truncate max-w-[120px] md:max-w-none">
                    {title}
                </h1>
                {badge && (
                    <span className="ml-2 lf-caption text-lf-accent bg-lf-accent/5 border border-lf-accent/10 px-2 py-0.5 rounded-r-sm hidden sm:inline-block">
                        {badge}
                    </span>
                )}
            </div>

            <div className="flex-1 flex justify-center">
                {children}
            </div>

            <div className="ml-auto flex items-center gap-3">
                {isEnabled && (
                    <span className="lf-caption text-lf-text4 font-mono hidden md:inline-block">
                        ↻ {formattedTime}
                    </span>
                )}
                <button className="p-2 rounded-r-sm text-lf-text4 hover:text-lf-text hover:bg-lf-s3 transition-all">
                    <RefreshCw size={14} className="hover:rotate-180 transition-transform duration-500" />
                </button>
            </div>
        </header>
    )
}
