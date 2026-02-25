import { toast } from 'sonner'

export async function migrateLocalStorageToNeon(): Promise<void> {
    const MIGRATION_FLAG = 'linkedflow_migrated_neon_v1'

    // Se não houver window ou já tiver migrado, ignora
    if (typeof window === 'undefined' || localStorage.getItem(MIGRATION_FLAG) === 'true') {
        return
    }

    try {
        const rawProfiles = localStorage.getItem('linkedflow-profiles')
        const rawSettings = localStorage.getItem('linkedflow-settings')
        const rawHistory = localStorage.getItem('linkedflow-history')

        // Se não houver nada local, marca como feito e sai
        if (!rawProfiles && !rawSettings && !rawHistory) {
            localStorage.setItem(MIGRATION_FLAG, 'true')
            return
        }

        const profiles = rawProfiles ? JSON.parse(rawProfiles).state?.profiles || [] : []
        const settings = rawSettings ? JSON.parse(rawSettings).state || {} : {}
        const history = rawHistory ? JSON.parse(rawHistory).state?.posts || [] : []

        if (profiles.length === 0 && history.length === 0 && !settings.persona) {
            localStorage.setItem(MIGRATION_FLAG, 'true')
            return
        }

        console.log('[MIGRATION] Iniciando migração do LocalStorage para Neon', { profilesCount: profiles.length })

        const res = await fetch('/api/migrate/local-storage', {
            method: 'POST',
            body: JSON.stringify({ profiles, settings, history }),
            headers: { 'Content-Type': 'application/json' }
        })

        if (!res.ok) {
            const errorData = await res.json()
            throw new Error(errorData.error?.message || 'Falha na API de migração')
        }

        localStorage.setItem(MIGRATION_FLAG, 'true')
        toast.success('Seus dados antigos foram importados para a nuvem! ☁️')
        console.log('[MIGRATION] Migração do LocalStorage concluída com sucesso')

        // OPCIONAL: se quisermos limpar os dados locais
        // localStorage.removeItem('linkedflow-profiles')
        // localStorage.removeItem('linkedflow-settings')
        // localStorage.removeItem('linkedflow-history')

    } catch (e) {
        console.error('[MIGRATION] Erro ao sincronizar localStorage', e)
    }
}
