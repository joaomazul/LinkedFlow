"use client";

import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSettingsStore } from '@/store/settings.store'

export function useAutoRefresh() {
    const qc = useQueryClient()
    const intervalMinutes = useSettingsStore(s => s.autoRefreshInterval || 0)
    const isEnabled = intervalMinutes > 0

    const [nextRefreshIn, setNextRefreshIn] = useState<number>(0)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const countdownRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        // Limpa intervals anteriores
        if (timerRef.current) clearInterval(timerRef.current)
        if (countdownRef.current) clearInterval(countdownRef.current)

        if (!isEnabled) {
            setTimeout(() => setNextRefreshIn(0), 0)
            return
        }

        const intervalMs = intervalMinutes * 60 * 1000
        setTimeout(() => setNextRefreshIn(intervalMinutes * 60), 0)

        // Intervalo de Refresh real
        timerRef.current = setInterval(() => {
            qc.invalidateQueries({ queryKey: ['feed'] })
            setNextRefreshIn(intervalMinutes * 60)
        }, intervalMs)

        // Intervalo do Countdown visual
        countdownRef.current = setInterval(() => {
            setNextRefreshIn(prev => (prev > 0 ? prev - 1 : intervalMinutes * 60))
        }, 1000)

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
            if (countdownRef.current) clearInterval(countdownRef.current)
        }
    }, [intervalMinutes, isEnabled, qc])

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    return {
        isEnabled,
        nextRefreshIn,
        formattedTime: formatTime(nextRefreshIn)
    }
}
