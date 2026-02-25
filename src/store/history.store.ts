import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { CommentHistoryEntry } from '@/types'

interface HistoryState {
    entries: CommentHistoryEntry[]
    addEntry: (entry: CommentHistoryEntry) => void
    removeEntry: (entryId: string) => void
    clearHistory: () => void
}

const HISTORY_LIMIT = 200

export const useHistoryStore = create<HistoryState>()(
    immer((set) => ({
        entries: [],

        addEntry: (entry) =>
            set((state) => {
                state.entries.unshift(entry)
                state.entries = state.entries.slice(0, HISTORY_LIMIT)
            }),

        removeEntry: (entryId) =>
            set((state) => {
                state.entries = state.entries.filter((e) => e.id !== entryId)
            }),

        clearHistory: () =>
            set((state) => {
                state.entries = []
            }),
    }))
)
