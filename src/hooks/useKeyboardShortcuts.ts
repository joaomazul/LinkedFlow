"use client";

import { useHotkeys } from 'react-hotkeys-hook'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useKeyboardShortcuts() {
    const qc = useQueryClient()

    // Global: Refresh feed with 'R'
    useHotkeys('r', () => {
        qc.invalidateQueries({ queryKey: ['feed'] })
        toast.info('Atualizando feed (R)')
    }, {
        // Evita disparar se estiver em um input/area
        enableOnFormTags: false
    })

    // Global: Focus search or first post with '/'
    useHotkeys('/', (e) => {
        e.preventDefault()
        const searchInput = document.querySelector('input[placeholder*="Buscar"]') as HTMLInputElement
        if (searchInput) {
            searchInput.focus()
        }
    })

    // Global: Escape closes things (handled by Radix Dialogs/Dropdowns usually, but for custom panels)
    useHotkeys('esc', () => {
        // Custom logic if needed to close AIPanel or similar
    })

    return null
}
