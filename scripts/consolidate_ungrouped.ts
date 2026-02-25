import { db } from '../src/db'
import { monitoredProfiles } from '../src/db/schema/profiles'
import { profileGroups } from '../src/db/schema/groups'
import { isNull, eq, and } from 'drizzle-orm'

async function migrate() {
    console.log('🚀 Iniciando consolidação de perfis sem grupo...')

    // 1. Encontrar todos os perfis sem grupo
    const ungrouped = await db.select({
        id: monitoredProfiles.id,
        userId: monitoredProfiles.userId
    })
        .from(monitoredProfiles)
        .where(isNull(monitoredProfiles.groupId))

    if (ungrouped.length === 0) {
        console.log('✅ Nenhum perfil sem grupo encontrado.')
        return
    }

    console.log(`📦 Encontrados ${ungrouped.length} perfis sem grupo.`)

    // 2. Agrupar por usuário para evitar múltiplas criações
    const usersWithUngrouped = Array.from(new Set(ungrouped.map(u => u.userId)))

    for (const userId of usersWithUngrouped) {
        // Verificar se o usuário já tem um grupo chamado "Sem Grupo"
        let group = (await db.select()
            .from(profileGroups)
            .where(and(
                eq(profileGroups.userId, userId),
                eq(profileGroups.name, 'Sem Grupo')
            ))
            .limit(1))[0]

        if (!group) {
            console.log(`🆕 Criando grupo "Sem Grupo" para o usuário ${userId}...`)
            const [newGroup] = await db.insert(profileGroups)
                .values({
                    userId,
                    name: 'Sem Grupo',
                    color: '#64748b' // Slate 500
                })
                .returning()
            group = newGroup
        }

        // Mover perfis deste usuário para este grupo
        const result = await db.update(monitoredProfiles)
            .set({ groupId: group.id })
            .where(and(
                eq(monitoredProfiles.userId, userId),
                isNull(monitoredProfiles.groupId)
            ))

        console.log(`✅ Movidos perfis do usuário ${userId} para o grupo "Sem Grupo".`)
    }

    console.log('🏁 Migração concluída com sucesso!')
    process.exit(0)
}

migrate().catch(err => {
    console.error('❌ Erro na migração:', err)
    process.exit(1)
})
