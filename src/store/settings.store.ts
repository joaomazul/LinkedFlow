import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type {
    AppSettings,
    PersonaConfig,
    CommentStyleConfig,
    CommentStyleId
} from '@/types'

interface SettingsState extends AppSettings {
    updatePersona: (persona: Partial<PersonaConfig>) => void
    updateCommentStyle: (styleId: CommentStyleId, updates: Partial<CommentStyleConfig>) => void
    addCommentStyle: (style: CommentStyleConfig) => void
    removeCommentStyle: (styleId: CommentStyleId) => void
    reorderStyles: (activeId: string, overId: string) => void
    duplicateStyle: (styleId: CommentStyleId) => void
    resetStyleToDefault: (styleId: CommentStyleId) => void
    resetAllStylesToDefault: () => void
    setDefaultStyle: (styleId: CommentStyleId) => void
    setLinkedinAccount: (accountId: string) => void
    setSettings: (settings: Partial<AppSettings>) => void
}

const DEFAULT_PERSONA: PersonaConfig = {
    name: '',
    role: '',
    company: '',
    niche: '',
    tone: 'profissional e prestativo',
    goals: '',
    avoid: '',
    customPrompt: '',
}

const DEFAULT_COMMENT_STYLES: CommentStyleConfig[] = [
    {
        id: 'positivo',
        label: 'Positivo',
        icon: '👍',
        description: 'Reconhece e celebra o conteúdo com entusiasmo genuíno',
        prompt: `Escreva um comentário genuinamente positivo. Reconheça um ponto específico e valioso do post — mostre que você leu de verdade. Elogie de forma concreta, nunca genérica. Não comece com "Ótimo post" ou similares. Seja humano, direto e entusiasmado.`,
        active: true,
        order: 0,
    },
    {
        id: 'valor',
        label: 'Agrega valor',
        icon: '💡',
        description: 'Adiciona dado, exemplo ou perspectiva complementar',
        prompt: `Escreva um comentário que agrega valor real à discussão. Inclua um dado concreto, exemplo prático, estatística relevante ou perspectiva complementar que enriquece o que foi dito. Seja específico, útil e cite a fonte se possível.`,
        active: true,
        order: 1,
    },
    {
        id: 'pergunta',
        label: 'Pergunta',
        icon: '❓',
        description: 'Faz uma pergunta genuína que aprofunda o tema',
        prompt: `Escreva um comentário com uma única pergunta genuína e inteligente. A pergunta deve ser específica ao conteúdo do post, mostrar que você leu com atenção e despertar curiosidade no autor e em outros leitores. Não faça perguntas óbvias ou retóricas.`,
        active: true,
        order: 2,
    },
    {
        id: 'sugestao',
        label: 'Sugestão',
        icon: '🔧',
        description: 'Oferece dica construtiva ou ponto de vista diferente',
        prompt: `Escreva um comentário construtivo com uma sugestão relevante ou perspectiva diferente. Seja respeitoso e baseie sua sugestão diretamente no conteúdo do post. Ofereça algo acionável, não apenas crítica. Reconheça o valor do post antes de sugerir.`,
        active: true,
        order: 3,
    },
    {
        id: 'relato',
        label: 'Relato pessoal',
        icon: '📖',
        description: 'Compartilha experiênca pessoal relacionada',
        prompt: `Escreva um comentário que compartilha uma experiência pessoal genuína e diretamente relacionada ao tema do post. Conecte sua vivência ao conteúdo de forma natural. Seja específico e autêntico — histórias reais engajam mais do que abstrações.`,
        active: true,
        order: 4,
    },
    {
        id: 'discordancia_respeitosa',
        label: 'Discordância',
        icon: '🤝',
        description: 'Apresenta ponto de vista contrário com respeito',
        prompt: `Escreva um comentário que apresenta uma perspectiva diferente ou questionamento construtivo. Reconheça os pontos válidos do post antes de apresentar sua discordância. Use dados, lógica ou experiência para embasar seu ponto. Seja respeitoso e evite tom combativo.`,
        active: true,
        order: 5,
    },
    {
        id: 'parabenizacao',
        label: 'Parabéns',
        icon: '🎉',
        description: 'Celebra conquista ou marco específico',
        prompt: `Escreva um comentário celebrando uma conquista ou marco mencionado no post. Seja genuíno, específico sobre o que está sendo celebrado e, se possível, mencione o impacto ou relevância daquela conquista. Evite ser excessivamente bajulador.`,
        active: true,
        order: 6,
    },
]

export const useSettingsStore = create<SettingsState>()(
    immer((set) => ({
        persona: DEFAULT_PERSONA,
        commentStyles: DEFAULT_COMMENT_STYLES,
        defaultStyleId: 'positivo',
        language: 'pt-BR',
        linkedinAccountId: process.env.NEXT_PUBLIC_UNIPILE_LINKEDIN_ACCOUNT_ID || '',
        autoRefreshInterval: 0,
        showRightPanel: true,

        updatePersona: (updates) =>
            set((state) => {
                state.persona = { ...state.persona, ...updates }
            }),

        updateCommentStyle: (styleId, updates) =>
            set((state) => {
                const index = state.commentStyles.findIndex((s) => s.id === styleId)
                if (index !== -1) {
                    state.commentStyles[index] = { ...state.commentStyles[index], ...updates }
                }
            }),

        addCommentStyle: (style) =>
            set((state) => {
                state.commentStyles.push(style)
            }),

        removeCommentStyle: (styleId) =>
            set((state) => {
                state.commentStyles = state.commentStyles.filter((s) => s.id !== styleId)
            }),

        reorderStyles: (activeId, overId) =>
            set((state) => {
                const oldIndex = state.commentStyles.findIndex((s) => s.id === activeId)
                const newIndex = state.commentStyles.findIndex((s) => s.id === overId)
                if (oldIndex !== -1 && newIndex !== -1) {
                    const [removed] = state.commentStyles.splice(oldIndex, 1)
                    state.commentStyles.splice(newIndex, 0, removed)
                    state.commentStyles.forEach((s, i) => (s.order = i))
                }
            }),

        duplicateStyle: (styleId) =>
            set((state) => {
                const original = state.commentStyles.find((s) => s.id === styleId)
                if (original) {
                    const newStyle = {
                        ...original,
                        id: `custom_${Date.now()}` as CommentStyleId,
                        label: `${original.label} (Cópia)`,
                        order: state.commentStyles.length,
                    }
                    state.commentStyles.push(newStyle)
                }
            }),

        resetStyleToDefault: (styleId) =>
            set((state) => {
                const index = state.commentStyles.findIndex((s) => s.id === styleId)
                const defaultStyle = DEFAULT_COMMENT_STYLES.find((s) => s.id === styleId)
                if (index !== -1 && defaultStyle) {
                    state.commentStyles[index] = {
                        ...defaultStyle,
                        order: state.commentStyles[index].order
                    }
                }
            }),

        resetAllStylesToDefault: () =>
            set((state) => {
                state.commentStyles = [...DEFAULT_COMMENT_STYLES]
            }),

        setDefaultStyle: (styleId) =>
            set((state) => {
                state.defaultStyleId = styleId
            }),

        setLinkedinAccount: (accountId) =>
            set((state) => {
                state.linkedinAccountId = accountId
            }),

        setSettings: (updates) =>
            set((state) => {
                Object.assign(state, updates)
            }),
    }))
)
