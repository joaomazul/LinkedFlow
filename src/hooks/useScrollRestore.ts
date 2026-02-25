"use client";

import { useEffect } from 'react'


export function useScrollRestore(key: string) {
    useEffect(() => {
        if (typeof window === 'undefined') return

        const savedPos = sessionStorage.getItem(`scroll_${key}`)
        if (savedPos) {
            // Pequeno delay para garantir que o DOM renderizou
            setTimeout(() => {
                window.scrollTo({ top: parseInt(savedPos, 10), behavior: 'instant' })
            }, 50)
        }

        const handleScroll = () => {
            sessionStorage.setItem(`scroll_${key}`, window.scrollY.toString())
        }

        let timeout: NodeJS.Timeout
        const debouncedScroll = () => {
            clearTimeout(timeout)
            timeout = setTimeout(handleScroll, 100)
        }

        window.addEventListener('scroll', debouncedScroll)
        return () => {
            window.removeEventListener('scroll', debouncedScroll)
            clearTimeout(timeout)
        }
    }, [key])
}
