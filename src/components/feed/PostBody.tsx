"use client";

import React, { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils/cn'

interface PostBodyProps {
    text: string
    imageUrls?: string[]
    videoUrl?: string
    articleUrl?: string
    articleTitle?: string
}

export function PostBody({ text, imageUrls, articleUrl, articleTitle }: PostBodyProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const isLong = text.length > 320

    return (
        <div className="space-y-4">
            <div className="relative">
                <p className={cn(
                    "lf-body text-lf-text2 whitespace-pre-wrap transition-all",
                    !isExpanded && isLong && "line-clamp-5"
                )}>
                    {text}
                </p>

                {isLong && !isExpanded && (
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="lf-caption font-bold text-lf-accent mt-2 hover:underline decoration-lf-accent/30 underline-offset-4"
                    >
                        ...ver mais
                    </button>
                )}
            </div>

            {imageUrls && imageUrls.length > 0 && (
                <div className={cn(
                    "grid gap-2 rounded-lg overflow-hidden border border-lf-border",
                    imageUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"
                )}>
                    {imageUrls.map((url, i) => (
                        <Image
                            key={i}
                            src={url}
                            alt="Post content"
                            width={800}
                            height={400}
                            unoptimized
                            className="w-full h-auto object-cover max-h-[400px] hover:scale-[1.01] transition-transform duration-[var(--t-slow)] cursor-pointer"
                        />
                    ))}
                </div>
            )}

            {articleUrl && (
                <a
                    href={articleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg border border-lf-border bg-lf-s3 p-4 hover:border-lf-accent/40 hover:bg-lf-s4 transition-all duration-[var(--t-fast)] group/article"
                >
                    <span className="lf-label text-lf-accent font-bold">Artigo</span>
                    <h4 className="lf-title text-lf-text mt-1 group-hover/article:text-lf-accent transition-colors">{articleTitle || 'Visualizar Artigo'}</h4>
                    <span className="lf-caption text-lf-text3 mt-1 block truncate font-mono opacity-80">{articleUrl}</span>
                </a>
            )}
        </div>
    )
}
