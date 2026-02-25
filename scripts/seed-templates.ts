import { db } from '../src/db'
import { postTemplates } from '../src/db/schema/posts'

const templates = [
    {
        name: 'Post Curto',
        format: 'short',
        description: 'Máximo impacto em poucas palavras. Ideal para reflexões, dados e citações.',
        systemPrompt: 'Você é um especialista em copywriting para LinkedIn. Crie posts curtos (máximo 300 caracteres) que geram alto engajamento. Seja direto, use linguagem ativa. Evite clichês corporativos.',
        userPromptTemplate: 'Crie um post CURTO e impactante sobre: {input_content}\n\nObjetivo: {objective}\nPúblico-alvo: {icp}\n\nRegras:\n- Máximo 300 caracteres\n- Primeiro parágrafo é o gancho — deve parar o scroll\n- Uma ideia por post\n- Tom: {tone}\n\nPost:',
        sortOrder: 1,
    },
    {
        name: 'Storytelling',
        format: 'storytelling',
        description: 'Narrativa pessoal com gancho emocional. Maior alcance orgânico.',
        systemPrompt: 'Você é um especialista em storytelling para LinkedIn. Crie narrativas autênticas e humanizadas que conectam o pessoal ao profissional. Use a estrutura: Situação → Conflito → Resolução → Lição.',
        userPromptTemplate: 'Crie um post em STORYTELLING sobre: {input_content}\n\nObjetivo: {objective}\nPúblico-alvo: {icp}\nTom: {tone}\n\nEstrutura obrigatória:\n1. Gancho (1 linha que prende)\n2. Situação (contexto pessoal/profissional)\n3. Conflito (o problema ou desafio)\n4. Resolução (o que aconteceu)\n5. Lição (o insight transferível)\n6. CTA sutil\n\nPost:',
        sortOrder: 2,
    },
    {
        name: 'Carrossel',
        format: 'carousel',
        description: 'Conteúdo educativo estruturado em slides. Maior tempo de leitura e salvamentos.',
        systemPrompt: 'Você cria estruturas de carrossel para LinkedIn. O conteúdo é textual mas formatado como se fosse um carrossel: slide 1 = capa/gancho, slides intermediários = conteúdo, último slide = CTA.',
        userPromptTemplate: 'Crie um CARROSSEL sobre: {input_content}\n\nObjetivo: {objective}\nPúblico-alvo: {icp}\nTom: {tone}\n\nFormato:\n[CAPA] Título do carrossel (máximo 8 palavras)\n[SLIDE 2] Subtítulo/introdução\n[SLIDE 3-8] Cada ponto com título + 2-3 linhas\n[ÚLTIMO SLIDE] CTA\n\nUse emojis como numeradores. Máximo 10 slides.\n\nCarrossel:',
        sortOrder: 3,
    },
    {
        name: 'Thread',
        format: 'thread',
        description: 'Série de micro-posts conectados. Ideal para tutoriais e análises aprofundadas.',
        systemPrompt: 'Você cria threads para LinkedIn. Cada "post" da thread é curto e independente, mas todos conectados por um fio narrativo. Numere cada post.',
        userPromptTemplate: 'Crie uma THREAD sobre: {input_content}\n\nObjetivo: {objective}\nPúblico-alvo: {icp}\nTom: {tone}\n\nFormato:\nPost 1/N: Gancho — deve gerar curiosidade para continuar\nPost 2/N a N-1/N: Desenvolvimento (cada um com uma ideia completa)\nPost N/N: Conclusão + CTA\n\nMáximo 7 posts. Cada post máximo 200 chars.\n\nThread:',
        sortOrder: 4,
    },
    {
        name: 'Opinião Forte',
        format: 'controversial',
        description: 'Take direto e opinativo. Gera debates e posicionamento de autoridade.',
        systemPrompt: 'Você cria posts de opinião para LinkedIn. Seja direto, tome partido, use dados quando possível. Evite ficar em cima do muro. O objetivo é gerar debate qualificado.',
        userPromptTemplate: 'Crie um post de OPINIÃO FORTE sobre: {input_content}\n\nObjetivo: {objective}\nPúblico-alvo: {icp}\nTom: {tone}\n\nEstrutura:\n- Afirmação forte logo no início (não suavize)\n- 2-3 argumentos de suporte\n- Reconheça a contra-argumentação mais óbvia\n- Reforce sua posição\n- Pergunta que provoca o leitor a comentar\n\nPost:',
        sortOrder: 5,
    },
    {
        name: 'Lead Magnet CTA',
        format: 'lead_magnet_cta',
        description: 'Post criado para gerar comentários e capturar leads com material gratuito.',
        systemPrompt: 'Você cria posts para captura de leads no LinkedIn. O post deve gerar desejo pelo material, pedir um comentário específico como "trigger" e prometer entrega via DM.',
        userPromptTemplate: 'Crie um post de LEAD MAGNET para: {input_content}\n\nLead magnet a ser entregue: {lead_magnet_label}\nObjetivo: {objective}\nPúblico-alvo: {icp}\nTom: {tone}\n\nEstrutura:\n1. Problema/dor que o material resolve\n2. O que o material contém (bullet points do valor)\n3. Como receber: "Comente PALAVRA e eu envio no seu DM"\n4. Urgência sutil (opcional)\n\n⚠️ A PALAVRA de ativação deve ser específica (ex: "GUIA", "PLANILHA", "TEMPLATE")\n\nPost:',
        sortOrder: 6,
    },
]

async function main() {
    console.log('Seeding templates...')
    for (const t of templates) {
        await db.insert(postTemplates).values(t).onConflictDoNothing()
    }
    console.log('Done!')
}

main().catch(console.error)
