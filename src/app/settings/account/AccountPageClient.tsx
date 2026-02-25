"use client"

export const dynamic = 'force-dynamic'

import { AccountSettings } from '@/components/settings/AccountSettings'


import { AppShell } from '@/components/layout/AppShell'

export default function AccountSettingsPage() {
    return (
        <AppShell title="Conta LinkedIn">
            <AccountSettings />
        </AppShell>
    )
}
