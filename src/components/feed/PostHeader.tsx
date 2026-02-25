"use client";

import React from 'react'
import { formatRelativeTime } from '@/lib/utils/format'
import { ExternalLink, MoreHorizontal } from 'lucide-react'

interface PostHeaderProps {
    authorName: string
    authorRole: string
    authorInitials: string
    authorColor: string
    postedAt: string
    url?: string
}

export function PostHeader({
    authorName,
    authorRole,
    authorInitials,
    authorColor,
    postedAt,
    url
}: PostHeaderProps) {
    return (
        <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                    className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-md lf-subtitle font-bold"
                    style={{
                        backgroundColor: `${authorColor}26`,
                        color: authorColor,
                        border: `1px solid ${authorColor}40`
                    }}
                >
                    {authorInitials}
                </div>

                <div className="flex flex-col min-w-0">
                    <h3 className="lf-subtitle lf-text leading-tight truncate">
                        {authorName}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="lf-caption text-lf-text3 truncate max-w-[200px]">
                            {authorRole}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-lf-text4 opacity-40" />
                        <span className="lf-caption text-lf-text4">
                            {formatRelativeTime(postedAt)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {url && (
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-lf-border bg-lf-s2 text-lf-text3 hover:text-lf-accent hover:border-lf-accent/40 transition-colors"
                        title="Ver no LinkedIn"
                    >
                        <span className="lf-caption font-bold">Abrir Post</span>
                        <ExternalLink size={14} />
                    </a>
                )}
                <button className="p-2 rounded-md text-lf-text3 hover:text-lf-text2 hover:bg-lf-s3 transition-colors">
                    <MoreHorizontal size={16} />
                </button>
            </div>
        </div>
    )
}
