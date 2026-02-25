"use client";

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { useSettingsStore } from '@/store/settings.store'

const PUBLIC_ROUTES = ['/sign-in', '/sign-up', '/sso-callback', '/setup-required']

export function OnboardingGuard({
    children,
    defaultAccountId
}: {
    children: React.ReactNode
    defaultAccountId?: string
}) {
    const router = useRouter()
    const pathname = usePathname()

    const { isLoaded, isSignedIn } = useAuth()

    const linkedinAccountId = useSettingsStore(s => s.linkedinAccountId)
    const setLinkedinAccount = useSettingsStore(s => s.setLinkedinAccount)
    const [isHydrated, setIsHydrated] = useState(false)

    useEffect(() => {
        // Hidrata conta default via server-side se vazio no cliente
        if (!linkedinAccountId && defaultAccountId) {
            setLinkedinAccount(defaultAccountId)
        }
        setIsHydrated(true)
    }, [defaultAccountId, linkedinAccountId, setLinkedinAccount])

    useEffect(() => {
        if (!isLoaded || !isHydrated) return

        if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) return

        if (!isSignedIn) return

        if (pathname.startsWith('/onboarding')) return

        const activeAccount = linkedinAccountId || defaultAccountId
        const needsOnboarding = !activeAccount

        if (needsOnboarding) {
            router.replace('/onboarding')
        }
    }, [isLoaded, isHydrated, isSignedIn, pathname, router, linkedinAccountId, defaultAccountId])

    return <>{children}</>
}
