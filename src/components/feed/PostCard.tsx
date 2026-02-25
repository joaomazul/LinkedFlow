"use client";

import React from 'react'
import { LinkedInPost } from '@/types/linkedin.types'
import { PostHeader } from './PostHeader'
import { PostBody } from './PostBody'
import { PostStats } from './PostStats'
import { CommentZone } from './CommentZone'
import { motion } from 'framer-motion'

interface PostCardProps {
    post: LinkedInPost
    index?: number
}

export const PostCard = React.memo(function PostCard({ post, index = 0 }: PostCardProps) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
            className="group relative rounded-lg border border-lf-border bg-lf-s2 transition-all duration-[var(--t-normal)] hover:border-lf-border2 hover:shadow-lf-lg overflow-hidden mb-5"
        >
            <div className="p-6">
                <PostHeader
                    authorName={post.authorName}
                    authorRole={post.authorRole}
                    authorInitials={post.authorInitials}
                    authorColor={post.authorColor}
                    postedAt={post.postedAt}
                    url={post.url}
                />

                <PostBody
                    text={post.text}
                    imageUrls={post.imageUrls}
                    videoUrl={post.videoUrl}
                    articleUrl={post.articleUrl}
                    articleTitle={post.articleTitle}
                />

                <PostStats metrics={post.metrics} />
            </div>

            {/* Separador suave Cockpit */}
            <div className="h-[1px] w-full bg-lf-border opacity-60" />

            <CommentZone
                post={{
                    id: post.id,
                    linkedinPostId: post.linkedinPostId,
                    text: post.text,
                    authorName: post.authorName,
                }}
            />
        </motion.article>
    )
})
