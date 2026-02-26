"use client";

import { usePathname } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'

const pageTitles: Record<string, string> = {
    '/campaigns': 'Campanhas',
    '/analytics': 'Analytics',
    '/crm': 'CRM Social',
    '/signals': 'ABM Signals',
    '/cadence': 'Cadência',
    '/posts': 'Post Intelligence',
}

function getTitle(pathname: string): string {
    // Exact match first
    if (pageTitles[pathname]) return pageTitles[pathname]
    // Prefix match for nested routes like /campaigns/123/leads
    for (const [path, title] of Object.entries(pageTitles)) {
        if (pathname.startsWith(path)) return title
    }
    return 'LinkedFlow'
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const title = getTitle(pathname)

    return (
        <AppShell title={title}>
            {children}
        </AppShell>
    )
}
