import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { db, users, commentStyles, personas, appSettings } from './index'
import { eq } from 'drizzle-orm'

// Os 7 estilos padrão
const DEFAULT_STYLES = [
    {
        styleKey: 'positivo',
        label: 'Positivo',
        icon: '👍',
        description: 'Reconhece e celebra o conteúdo com entusiasmo genuíno',
        prompt: `Escreva um comentário genuinamente positivo. Reconheça um ponto específico e valioso do post — mostre que você leu de verdade. Elogie de forma concreta, nunca genérica. Não comece com "Ótimo post!" ou variações. Seja humano, direto e entusiasmado. Entre 30 e 120 palavras.`,
        displayOrder: 0,
    },
    {
        styleKey: 'valor',
        label: 'Agrega valor',
        icon: '💡',
        description: 'Adiciona dado, exemplo ou perspectiva complementar',
        prompt: `Escreva um comentário que agrega valor real à discussão. Inclua um dado concreto, exemplo prático, estatística relevante ou perspectiva complementar que enriquece o que foi dito. Seja específico e útil. Entre 40 e 130 palavras.`,
        displayOrder: 1,
    },
    {
        styleKey: 'pergunta',
        label: 'Pergunta',
        icon: '❓',
        description: 'Faz uma pergunta genuína que aprofunda o tema',
        prompt: `Escreva um comentário com uma única pergunta genuína e inteligente. Específica ao conteúdo, mostrando que você leu com atenção. Que desperte curiosidade no autor e outros leitores. Não faça perguntas óbvias ou retóricas. Entre 20 e 80 palavras.`,
        displayOrder: 2,
    },
    {
        styleKey: 'sugestao',
        label: 'Sugestão',
        icon: '🔧',
        description: 'Oferece dica construtiva ou ponto de vista diferente',
        prompt: `Escreva um comentário com uma sugestão relevante ou perspectiva diferente. Respeite e reconheça o valor do post antes. Baseie sua sugestão diretamente no conteúdo. Seja construtivo, nunca condescendente. Entre 40 e 130 palavras.`,
        displayOrder: 3,
    },
    {
        styleKey: 'relato',
        label: 'Relato pessoal',
        icon: '📖',
        description: 'Compartilha experiência pessoal relacionada',
        prompt: `Escreva um comentário que compartilha uma experiência pessoal genuína e diretamente relacionada ao tema. Conecte sua vivência ao conteúdo de forma natural. Seja específico — histórias concretas engajam mais do que abstrações. Entre 40 e 130 palavras.`,
        displayOrder: 4,
    },
    {
        styleKey: 'discordancia_respeitosa',
        label: 'Discordância',
        icon: '🤝',
        description: 'Apresenta ponto de vista contrário com respeito',
        prompt: `Escreva um comentário que apresenta perspectiva diferente ou questionamento construtivo. Reconheça os pontos válidos antes de discordar. Use dados, lógica ou experiência. Seja respeitoso, nunca combativo. Entre 50 e 140 palavras.`,
        displayOrder: 5,
    },
    {
        styleKey: 'parabenizacao',
        label: 'Parabéns',
        icon: '🎉',
        description: 'Celebra conquista ou marco específico',
        prompt: `Escreva um comentário celebrando a conquista ou marco do post. Seja genuíno e específico sobre o que está sendo celebrado. Mencione o impacto ou significado daquela conquista. Evite ser excessivamente bajulador. Entre 20 e 80 palavras.`,
        displayOrder: 6,
    },
]

async function seed() {
    console.log('🌱 Iniciando seed...')

    // 1. Cria usuário padrão (enquanto não há autenticação)
    const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, 'default@linkedflow.app'))
        .limit(1)

    let userId: string

    if (existingUser) {
        userId = existingUser.id
        console.log('✓ Usuário padrão já existe:', userId)
    } else {
        const [newUser] = await db
            .insert(users)
            .values({
                email: 'default@linkedflow.app',
                name: 'Usuário Principal',
            })
            .returning()
        userId = newUser.id
        console.log('✓ Usuário padrão criado:', userId)
    }

    // 2. Cria estilos de comentário padrão
    for (const style of DEFAULT_STYLES) {
        await db
            .insert(commentStyles)
            .values({
                userId,
                ...style,
                defaultPrompt: style.prompt,
                isCustom: false,
                active: true,
                usageCount: 0,
            })
            .onConflictDoNothing()
    }
    console.log(`✓ ${DEFAULT_STYLES.length} estilos de comentário criados`)

    // 3. Cria persona vazia
    const existingPersona = await db
        .select()
        .from(personas)
        .where(eq(personas.userId, userId))
        .limit(1)

    if (!existingPersona.length) {
        await db.insert(personas).values({
            userId,
            name: 'Minha Persona',
            isActive: 'true',
        })
        console.log('✓ Persona inicial criada')
    }

    // 4. Cria settings padrão
    await db
        .insert(appSettings)
        .values({ userId })
        .onConflictDoNothing()
    console.log('✓ Settings padrão criados')

    console.log('✅ Seed concluído!')
    process.exit(0)
}

seed().catch((err) => {
    console.error('❌ Erro no seed:', err)
    process.exit(1)
})
