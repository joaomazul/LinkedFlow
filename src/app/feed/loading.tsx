import { PostCardSkeleton } from '@/components/feed/PostCardSkeleton'

export default function FeedLoading() {
    return (
        <div className="max-w-3xl mx-auto w-full px-6 py-8">
            <div className="mb-10 w-48 h-10 bg-linkedflow-s1 animate-pulse rounded-md" />
            <div className="flex flex-col gap-8">
                {[1, 2, 3].map(i => <PostCardSkeleton key={i} />)}
            </div>
        </div>
    )
}
