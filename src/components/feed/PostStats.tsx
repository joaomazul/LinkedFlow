"use client";

import React from 'react'
import { PostMetrics } from '@/types/linkedin.types'
import { formatNumber } from '@/lib/utils/format'
import { ThumbsUp, MessageCircle, Repeat2, Eye } from 'lucide-react'

interface PostStatsProps {
    metrics: PostMetrics
}

export function PostStats({ metrics }: PostStatsProps) {
    return (
        <div className="flex items-center gap-5 mt-6 border-t border-lf-border/30 pt-4">
            <StatItem
                icon={<ThumbsUp size={12} />}
                value={metrics.likes}
                label="Likes"
            />
            <StatItem
                icon={<MessageCircle size={12} />}
                value={metrics.comments}
                label="Comments"
            />
            <StatItem
                icon={<Repeat2 size={12} />}
                value={metrics.reposts}
                label="Reposts"
            />
            {metrics.views !== undefined && (
                <StatItem
                    icon={<Eye size={12} />}
                    value={metrics.views}
                    label="Views"
                />
            )}
        </div>
    )
}

function StatItem({ icon, value, label }: { icon: React.ReactNode, value: number, label: string }) {
    return (
        <div className="flex items-center gap-1.5 text-lf-text3 group/stat transition-colors hover:text-lf-text2" title={label}>
            <span>
                {icon}
            </span>
            <span className="lf-caption font-600">
                {formatNumber(value)}
            </span>
        </div>
    )
}
