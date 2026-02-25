import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { MonitoredProfile, ProfileGroup } from '@/types'

interface ProfilesState {
    profiles: MonitoredProfile[]
    groups: ProfileGroup[]
    addProfile: (profile: MonitoredProfile) => void
    removeProfile: (profileId: string) => void
    toggleProfile: (profileId: string) => void
    updateProfile: (profileId: string, updates: Partial<MonitoredProfile>) => void
    setLastFetched: (profileId: string, timestamp: string) => void
    reorderProfiles: (profileIds: string[]) => void
    setProfiles: (profiles: MonitoredProfile[]) => void

    // Group methods
    setGroups: (groups: ProfileGroup[]) => void
    addGroup: (group: ProfileGroup) => void
    removeGroup: (groupId: string) => void
    updateGroup: (groupId: string, updates: Partial<ProfileGroup>) => void
    toggleGroup: (groupId: string, active: boolean) => void
    deleteProfile: (profileId: string) => void
}

export const useProfilesStore = create<ProfilesState>()(
    immer((set) => ({
        profiles: [],
        groups: [],

        addProfile: (profile) =>
            set((state) => {
                state.profiles.push(profile)
            }),

        removeProfile: (profileId) =>
            set((state) => {
                state.profiles = state.profiles.filter((p) => p.id !== profileId)
            }),

        toggleProfile: (profileId) =>
            set((state) => {
                const profile = state.profiles.find((p) => p.id === profileId)
                if (profile) {
                    profile.active = !profile.active
                }
            }),

        updateProfile: (profileId, updates) =>
            set((state) => {
                const index = state.profiles.findIndex((p) => p.id === profileId)
                if (index !== -1) {
                    state.profiles[index] = { ...state.profiles[index], ...updates }
                }
            }),

        setLastFetched: (profileId, timestamp) =>
            set((state) => {
                const profile = state.profiles.find((p) => p.id === profileId)
                if (profile) {
                    profile.lastFetchedAt = timestamp
                }
            }),

        reorderProfiles: (profileIds) =>
            set((state) => {
                const sorted = [...state.profiles].sort((a, b) => {
                    return profileIds.indexOf(a.id) - profileIds.indexOf(b.id)
                })
                state.profiles = sorted
            }),

        setProfiles: (profiles) =>
            set((state) => {
                state.profiles = profiles
            }),

        setGroups: (groups) =>
            set((state) => {
                state.groups = groups
            }),

        addGroup: (group) =>
            set((state) => {
                state.groups.push(group)
            }),

        removeGroup: (groupId) =>
            set((state) => {
                state.groups = state.groups.filter((g) => g.id !== groupId)
                // Unset groupId for profiles in this group
                state.profiles.forEach(p => {
                    if (p.groupId === groupId) delete p.groupId
                })
            }),

        updateGroup: (groupId, updates) =>
            set((state) => {
                const index = state.groups.findIndex((g) => g.id === groupId)
                if (index !== -1) {
                    state.groups[index] = { ...state.groups[index], ...updates }
                }
            }),

        toggleGroup: (groupId, active) =>
            set((state) => {
                state.profiles.forEach((p) => {
                    if (p.groupId === groupId) {
                        p.active = active
                    }
                })
            }),

        deleteProfile: (profileId) =>
            set((state) => {
                state.profiles = state.profiles.filter((p) => p.id !== profileId)
            }),
    }))
)
