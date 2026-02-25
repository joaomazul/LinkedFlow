export const DEFAULT_COMMENT_STYLES = [
    {
        styleKey: 'positivo', label: 'Positivo', icon: '👍', displayOrder: 0,
        description: 'Reconhece e celebra o conteúdo com entusiasmo genuíno',
        prompt: `Escreva um comentário genuinamente positivo. Reconheça um ponto específico e valioso do post — mostre que você leu de verdade. Elogie de forma concreta, nunca genérica. Não comece com "Ótimo post!" ou variações. Seja humano, direto e entusiasmado. Entre 30 e 120 palavras.`,
    },
    {
        styleKey: 'valor', label: 'Agrega valor', icon: '💡', displayOrder: 1,
        description: 'Adiciona dado, exemplo ou perspectiva complementar',
        prompt: `Escreva um comentário que agrega valor real à discussão. Inclua um dado concreto, exemplo prático, estatística relevante ou perspectiva complementar que enriquece o que foi dito. Seja específico e útil. Entre 40 e 130 palavras.`,
    },
    {
        styleKey: 'pergunta', label: 'Pergunta', icon: '❓', displayOrder: 2,
        description: 'Faz uma pergunta genuína que aprofunda o tema',
        prompt: `Escreva um comentário com uma única pergunta genuína e inteligente. Específica ao conteúdo, mostrando que você leu com atenção. Que desperte curiosidade no autor e outros leitores. Não faça perguntas óbvias ou retóricas. Entre 20 e 80 palavras.`,
    },
    {
        styleKey: 'sugestao', label: 'Sugestão', icon: '🔧', displayOrder: 3,
        description: 'Oferece dica construtiva ou perspectiva diferente',
        prompt: `Escreva um comentário com uma sugestão relevante ou perspectiva diferente. Respeite e reconheça o valor do post antes. Baseie sua sugestão diretamente no conteúdo. Seja construtivo, nunca condescendente. Entre 40 e 130 palavras.`,
    },
    {
        styleKey: 'relato', label: 'Relato pessoal', icon: '📖', displayOrder: 4,
        description: 'Compartilha experiência pessoal relacionada',
        prompt: `Escreva um comentário que compartilha uma experiência pessoal genuína e diretamente relacionada ao tema. Conecte sua vivência ao conteúdo de forma natural. Seja específico — histórias concretas engajam mais do que abstrações. Entre 40 e 130 palavras.`,
    },
    {
        styleKey: 'discordancia_respeitosa', label: 'Discordância', icon: '🤝', displayOrder: 5,
        description: 'Apresenta ponto de vista contrário com respeito',
        prompt: `Escreva um comentário que apresenta perspectiva diferente ou questionamento construtivo. Reconheça os pontos válidos antes de discordar. Use dados, lógica ou experiência. Seja respeitoso, nunca combativo. Entre 50 e 140 palavras.`,
    },
    {
        styleKey: 'parabenizacao', label: 'Parabéns', icon: '🎉', displayOrder: 6,
        description: 'Celebra conquista ou marco específico',
        prompt: `Escreva um comentário celebrando a conquista ou marco do post. Seja genuíno e específico sobre o que está sendo celebrado. Mencione o impacto ou significado daquela conquista. Evite ser excessivamente bajulador. Entre 20 e 80 palavras.`,
    },
] as const
