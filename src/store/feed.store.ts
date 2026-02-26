import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type {
    LinkedInPost,
    CommentStatus,
    DraftComment,
    PostedComment
} from '@/types'

interface FeedState {
    posts: LinkedInPost[]
    isLoading: boolean
    error: string | null
    lastRefreshedAt: string | null
    cursor: string | null
    setPosts: (posts: LinkedInPost[]) => void
    addPosts: (posts: LinkedInPost[]) => void
    updatePost: (postId: string, updates: Partial<LinkedInPost>) => void
    setCommentStatus: (postId: string, status: CommentStatus) => void
    setDraftComment: (postId: string, draft: DraftComment) => void
    clearDraft: (postId: string) => void
    markAsPosted: (postId: string, posted: PostedComment) => void
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void
    setCursor: (cursor: string | null) => void
}

export const useFeedStore = create<FeedState>()(
    immer((set) => ({
        posts: [],
        isLoading: false,
        error: null,
        lastRefreshedAt: null,
        cursor: null,

        setPosts: (posts) =>
            set((state) => {
                const unique = Array.from(new Map(posts.map(p => [p.linkedinPostId, p])).values())
                state.posts = unique.slice(0, 500)
                state.lastRefreshedAt = new Date().toISOString()
            }),

        addPosts: (posts) =>
            set((state) => {
                const combined = [...state.posts, ...posts]
                const unique = Array.from(new Map(combined.map(p => [p.linkedinPostId, p])).values())
                state.posts = unique.slice(0, 500)
            }),

        updatePost: (postId, updates) =>
            set((state) => {
                const index = state.posts.findIndex((p) => p.id === postId)
                if (index !== -1) {
                    state.posts[index] = { ...state.posts[index], ...updates }
                }
            }),

        setCommentStatus: (postId, status) =>
            set((state) => {
                const post = state.posts.find((p) => p.id === postId)
                if (post) {
                    post.commentStatus = status
                }
            }),

        setDraftComment: (postId, draft) =>
            set((state) => {
                const post = state.posts.find((p) => p.id === postId)
                if (post) {
                    post.myComment = draft
                    post.commentStatus = 'drafting'
                }
            }),

        clearDraft: (postId) =>
            set((state) => {
                const post = state.posts.find((p) => p.id === postId)
                if (post) {
                    post.myComment = undefined
                    post.commentStatus = 'idle'
                }
            }),

        markAsPosted: (postId, posted) =>
            set((state) => {
                const post = state.posts.find((p) => p.id === postId)
                if (post) {
                    post.myComment = posted
                    post.commentStatus = 'posted'
                }
            }),

        setLoading: (loading) =>
            set((state) => {
                state.isLoading = loading
            }),

        setError: (error) =>
            set((state) => {
                state.error = error
            }),

        setCursor: (cursor) =>
            set((state) => {
                state.cursor = cursor
            }),
    }))
)
