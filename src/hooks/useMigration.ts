"use client";
import { useEffect } from 'react'

import { migrateLocalStorageToNeon } from '@/lib/migrations/localStorage-to-neon'

export function useMigration() {
    useEffect(() => {
        migrateLocalStorageToNeon()
    }, [])
}
