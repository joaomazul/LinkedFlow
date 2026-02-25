'use client'

import { useState, useEffect } from 'react'
import { Plus, LayoutList, CheckCircle, FileText, MoreHorizontal, Pencil, Rocket, Trash } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function PostsPage() {
    const [posts, setPosts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('draft')

    const fetchPosts = async (status: string) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/posts?status=${status}`)
            const data = await res.json()
            if (data.ok) {
                setPosts(data.data)
            }
        } catch (err) {
            toast.error('Erro ao buscar posts')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPosts(activeTab)
    }, [activeTab])

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Post Intelligence</h1>
                    <p className="text-muted-foreground mt-1">Crie posts virais otimizados para o seu perfil do LinkedIn.</p>
                </div>
                <Button asChild className="gap-2">
                    <Link href="/posts/new">
                        <Plus className="w-4 h-4" /> Novo Post
                    </Link>
                </Button>
            </div>

            <Tabs defaultValue="draft" onValueChange={setActiveTab}>
                <div className="flex items-center justify-between mb-4">
                    <TabsList>
                        <TabsTrigger value="draft" className="gap-2">
                            <FileText className="w-4 h-4" /> Rascunhos
                        </TabsTrigger>
                        <TabsTrigger value="published" className="gap-2">
                            <CheckCircle className="w-4 h-4" /> Publicados
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="draft" className="mt-0">
                    <PostsGrid posts={posts} loading={loading} />
                </TabsContent>
                <TabsContent value="published" className="mt-0">
                    <PostsGrid posts={posts} loading={loading} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

function PostsGrid({ posts, loading }: { posts: any[], loading: boolean }) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-64 w-full rounded-xl" />
                ))}
            </div>
        )
    }

    if (posts.length === 0) {
        return (
            <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <LayoutList className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">Nenhum post encontrado</h3>
                <p className="text-muted-foreground max-w-sm mt-2">Você ainda não tem posts nesta categoria. Comece criando um novo post!</p>
                <Button asChild variant="outline" className="mt-6">
                    <Link href="/posts/new">Criar meu primeiro post</Link>
                </Button>
            </Card>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
                <PostCard key={post.id} post={post} />
            ))}
        </div>
    )
}

function PostCard({ post }: { post: any }) {
    const scoreColor = post.scoreOverall >= 80 ? 'text-green-500' : post.scoreOverall >= 60 ? 'text-yellow-500' : 'text-red-500'

    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-shadow overflow-hidden border-border/50">
            <div className="p-6 flex-1 flex flex-col space-y-4">
                <div className="flex justify-between items-start">
                    <Badge variant="outline" className="capitalize">{post.format || 'Post'}</Badge>
                    {post.scoreOverall && (
                        <div className={`text-sm font-bold ${scoreColor}`}>
                            Score: {post.scoreOverall}
                        </div>
                    )}
                </div>

                <p className="text-sm line-clamp-4 text-muted-foreground flex-1">
                    {post.body}
                </p>

                <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                    <span>Criado em {format(new Date(post.createdAt), "dd 'de' MMM", { locale: ptBR })}</span>
                    {post.status === 'published' && (
                        <Badge variant="secondary" className="h-4 text-[9px] bg-emerald-100 text-emerald-700 border-emerald-200">Publicado</Badge>
                    )}
                </div>
            </div>

            <div className="p-4 border-t bg-muted/30 flex justify-between items-center gap-2">
                <Button asChild variant="ghost" size="sm" className="flex-1 gap-2">
                    <Link href={`/posts/${post.id}`}>
                        <Pencil className="w-3 h-3" /> Editar
                    </Link>
                </Button>
                {post.status === 'draft' && (
                    <Button variant="ghost" size="sm" className="flex-1 gap-2 text-primary hover:text-primary">
                        <Rocket className="w-3 h-3" /> Publicar
                    </Button>
                )}
            </div>
        </Card>
    )
}
