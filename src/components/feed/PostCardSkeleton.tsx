"use client";

import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export function PostCardSkeleton() {
    return (
        <div className="rounded-[20px] border border-lf-border bg-lf-s2 p-6 space-y-5 mb-5 overflow-hidden">
            <div className="flex items-center gap-3">
                <Skeleton className="h-[36px] w-[36px] rounded-md bg-lf-s3" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[140px] bg-lf-s3" />
                    <Skeleton className="h-3 w-[100px] bg-lf-s3" />
                </div>
            </div>

            <div className="space-y-3">
                <Skeleton className="h-4 w-full bg-lf-s3" />
                <Skeleton className="h-4 w-full bg-lf-s3" />
                <Skeleton className="h-4 w-2/3 bg-lf-s3" />
            </div>

            <div className="flex gap-5 pt-3 border-t border-lf-border/30">
                <Skeleton className="h-3 w-12 bg-lf-s3" />
                <Skeleton className="h-3 w-12 bg-lf-s3" />
                <Skeleton className="h-3 w-12 bg-lf-s3" />
            </div>
        </div>
    )
}
