// Representa um perfil monitorado pelo usuário no app
export interface MonitoredProfile {
  id: string
  name: string
  url: string               // URL do perfil (normalizada)
  linkedinUrl: string       // URL do perfil vinculada no DB
  linkedinId?: string        // ID do LinkedIn obtido via Unipile
  role: string
  company?: string
  avatarUrl?: string
  initials: string
  color: string              // cor visual no app (hex)
  active: boolean
  addedAt: string            // ISO date
  lastFetchedAt?: string
  groupId?: string           // ID do grupo ao qual pertence
}

export interface ProfileGroup {
  id: string
  name: string
  color?: string
  createdAt: string
  updatedAt: string
}

export type LinkedInProfile = MonitoredProfile // Alias para compatibilidade

// Post do LinkedIn
export interface LinkedInPost {
  id: string
  linkedinPostId: string     // ID nativo do LinkedIn
  authorId: string           // ref ao MonitoredProfile.id
  authorName: string
  authorRole: string
  authorLinkedinId?: string
  authorAvatarUrl?: string
  authorInitials: string
  authorColor: string
  text: string               // conteúdo textual do post
  htmlText?: string          // conteúdo HTML se disponível
  imageUrls?: string[]       // imagens anexadas
  videoUrl?: string
  articleUrl?: string        // link de artigo se for post de artigo
  articleTitle?: string
  metrics: PostMetrics
  postedAt: string           // ISO date
  fetchedAt: string
  commentStatus: CommentStatus
  myComment?: DraftComment | PostedComment
  url?: string               // URL direta do post
}

export interface PostMetrics {
  likes: number
  comments: number
  reposts: number
  views?: number
}

export type CommentStatus = 'idle' | 'drafting' | 'approved' | 'posted' | 'failed'

// Comentário em rascunho (gerado pela IA, aguardando aprovação)
export interface DraftComment {
  text: string
  styleId: CommentStyleId
  generatedAt: string
  editedByUser: boolean
}

// Comentário efetivamente postado
export interface PostedComment {
  text: string
  styleId: CommentStyleId | 'manual'
  linkedinCommentId?: string  // ID retornado pelo Unipile após postagem
  postedAt: string
  wasEdited: boolean
}

// Entrada no histórico de comentários
export interface CommentHistoryEntry {
  id: string
  postId: string
  authorName: string         // Nome do autor do post
  authorColor: string        // Cor do autor do post
  postSnippet: string        // Primeiras ~80 chars do post
  text: string               // Texto do comentário postado
  styleId: CommentStyleId | 'manual'
  timestamp: string          // ISO date
  linkedinCommentId?: string
}

export type CommentStyleId =
  | 'positivo'
  | 'valor'
  | 'pergunta'
  | 'sugestao'
  | 'relato'
  | 'discordancia_respeitosa'
  | 'parabenizacao'
  | 'customizado'
