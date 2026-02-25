import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThumbsUpIcon, MessageSquareIcon, BarChart3Icon } from 'lucide-react'

interface Post {
    id: string
    body: string
    format: string
    likes: number
    comments: number
    engagementRate: string
}

interface TopPostsProps {
    posts: Post[]
}

export function TopPosts({ posts }: TopPostsProps) {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <TrophyIcon className="w-5 h-5 text-yellow-500" />
                    Posts de Maior Performance
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {posts.map((post) => (
                        <div key={post.id} className="flex items-start gap-4">
                            <div className="flex-1 space-y-2">
                                <p className="text-sm line-clamp-2 italic text-muted-foreground">
                                    "{post.body}"
                                </p>
                                <div className="flex items-center gap-4">
                                    <Badge variant="outline" className="text-[10px] uppercase">
                                        {post.format}
                                    </Badge>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                                        <ThumbsUpIcon className="w-3 h-3 text-blue-500" />
                                        {post.likes}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                                        <MessageSquareIcon className="w-3 h-3 text-green-500" />
                                        {post.comments}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-primary font-bold">
                                        <BarChart3Icon className="w-3 h-3" />
                                        {post.engagementRate}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {posts.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            Ainda não há dados suficientes para o ranking.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

function TrophyIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
    )
}
