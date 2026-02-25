export * from './users'
export * from './linkedin-accounts'
export * from './profiles'
export * from './posts'
export * from './comments'
export * from './comment-styles'
export * from './personas'
export * from './settings'
export * from './groups'
export * from './campaigns'
export * from './analytics'
export * from './crm'
export * from './signals'
export * from './cadence'

// Relations (necessário para Drizzle ORM fazer joins tipados)
import { relations } from 'drizzle-orm'
import { users } from './users'
import { linkedinAccounts } from './linkedin-accounts'
import { monitoredProfiles } from './profiles'
import { posts } from './posts'
import { comments } from './comments'
import { commentStyles } from './comment-styles'
import { personas } from './personas'
import { appSettings } from './settings'
import { profileGroups } from './groups'
import { campaigns, campaignLeads, campaignActions, campaignEvents } from './campaigns'
import { generatedPosts, postTemplates, brandVoiceCache } from './posts'
import { analyticsSnapshots, postPerformance, engagementInsights } from './analytics'
import { crmPeople, crmInteractions } from './crm'
import { abmTargets, abmSignals } from './signals'
import { cadenceSettings, cadenceSuggestions } from './cadence'

export const usersRelations = relations(users, ({ many, one }) => ({
    linkedinAccounts: many(linkedinAccounts),
    profiles: many(monitoredProfiles),
    posts: many(posts),
    generatedPosts: many(generatedPosts),
    postTemplates: many(postTemplates),
    brandVoiceCache: many(brandVoiceCache),
    comments: many(comments),
    commentStyles: many(commentStyles),
    personas: many(personas),
    groups: many(profileGroups),
    campaigns: many(campaigns),
    settings: one(appSettings),
    analyticsSnapshots: many(analyticsSnapshots),
    postPerformance: many(postPerformance),
    engagementInsights: many(engagementInsights),
    crmPeople: many(crmPeople),
    crmInteractions: many(crmInteractions),
    abmTargets: many(abmTargets),
    abmSignals: many(abmSignals),
    cadenceSuggestions: many(cadenceSuggestions),
    cadenceSettings: one(cadenceSettings),
}))

export const profilesRelations = relations(monitoredProfiles, ({ one, many }) => ({
    user: one(users, { fields: [monitoredProfiles.userId], references: [users.id] }),
    group: one(profileGroups, { fields: [monitoredProfiles.groupId], references: [profileGroups.id] }),
    posts: many(posts),
    comments: many(comments),
}))

export const groupsRelations = relations(profileGroups, ({ one, many }) => ({
    user: one(users, { fields: [profileGroups.userId], references: [users.id] }),
    profiles: many(monitoredProfiles),
}))

export const postsRelations = relations(posts, ({ one, many }) => ({
    user: one(users, { fields: [posts.userId], references: [users.id] }),
    profile: one(monitoredProfiles, { fields: [posts.profileId], references: [monitoredProfiles.id] }),
    comments: many(comments),
}))

export const commentsRelations = relations(comments, ({ one }) => ({
    user: one(users, { fields: [comments.userId], references: [users.id] }),
    post: one(posts, { fields: [comments.postId], references: [posts.id] }),
    profile: one(monitoredProfiles, { fields: [comments.profileId], references: [monitoredProfiles.id] }),
}))

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
    user: one(users, { fields: [campaigns.userId], references: [users.id] }),
    leads: many(campaignLeads),
    actions: many(campaignActions),
    events: many(campaignEvents),
}))

export const leadsRelations = relations(campaignLeads, ({ one, many }) => ({
    campaign: one(campaigns, { fields: [campaignLeads.campaignId], references: [campaigns.id] }),
    user: one(users, { fields: [campaignLeads.userId], references: [users.id] }),
    actions: many(campaignActions),
    events: many(campaignEvents),
}))

export const actionsRelations = relations(campaignActions, ({ one }) => ({
    campaign: one(campaigns, { fields: [campaignActions.campaignId], references: [campaigns.id] }),
    lead: one(campaignLeads, { fields: [campaignActions.leadId], references: [campaignLeads.id] }),
    user: one(users, { fields: [campaignActions.userId], references: [users.id] }),
}))

export const eventsRelations = relations(campaignEvents, ({ one }) => ({
    campaign: one(campaigns, { fields: [campaignEvents.campaignId], references: [campaigns.id] }),
    lead: one(campaignLeads, { fields: [campaignEvents.leadId], references: [campaignLeads.id] }),
    user: one(users, { fields: [campaignEvents.userId], references: [users.id] }),
}))

export const generatedPostsRelations = relations(generatedPosts, ({ one }) => ({
    user: one(users, { fields: [generatedPosts.userId], references: [users.id] }),
    parent: one(generatedPosts, {
        fields: [generatedPosts.parentId],
        references: [generatedPosts.id],
        relationName: 'versions',
    }),
}))

export const postTemplatesRelations = relations(postTemplates, ({ one }) => ({
    user: one(users, { fields: [postTemplates.userId], references: [users.id] }),
}))

export const brandVoiceCacheRelations = relations(brandVoiceCache, ({ one }) => ({
    user: one(users, { fields: [brandVoiceCache.userId], references: [users.id] }),
}))

export const analyticsSnapshotsRelations = relations(analyticsSnapshots, ({ one }) => ({
    user: one(users, { fields: [analyticsSnapshots.userId], references: [users.id] }),
}))

export const postPerformanceRelations = relations(postPerformance, ({ one }) => ({
    user: one(users, { fields: [postPerformance.userId], references: [users.id] }),
    generatedPost: one(generatedPosts, { fields: [postPerformance.generatedPostId], references: [generatedPosts.id] }),
}))

export const engagementInsightsRelations = relations(engagementInsights, ({ one }) => ({
    user: one(users, { fields: [engagementInsights.userId], references: [users.id] }),
}))

export const crmPeopleRelations = relations(crmPeople, ({ one, many }) => ({
    user: one(users, { fields: [crmPeople.userId], references: [users.id] }),
    interactions: many(crmInteractions),
}))

export const crmInteractionsRelations = relations(crmInteractions, ({ one }) => ({
    user: one(users, { fields: [crmInteractions.userId], references: [users.id] }),
    person: one(crmPeople, { fields: [crmInteractions.personId], references: [crmPeople.id] }),
}))

export const abmTargetsRelations = relations(abmTargets, ({ one, many }) => ({
    user: one(users, { fields: [abmTargets.userId], references: [users.id] }),
    profile: one(monitoredProfiles, { fields: [abmTargets.profileId], references: [monitoredProfiles.id] }),
}))

export const abmSignalsRelations = relations(abmSignals, ({ one }) => ({
    user: one(users, { fields: [abmSignals.userId], references: [users.id] }),
    profile: one(monitoredProfiles, { fields: [abmSignals.profileId], references: [monitoredProfiles.id] }),
    target: one(abmTargets, { fields: [abmSignals.targetId], references: [abmTargets.id] }),
}))

export const cadenceSettingsRelations = relations(cadenceSettings, ({ one }) => ({
    user: one(users, { fields: [cadenceSettings.userId], references: [users.id] }),
}))

export const cadenceSuggestionsRelations = relations(cadenceSuggestions, ({ one }) => ({
    user: one(users, { fields: [cadenceSuggestions.userId], references: [users.id] }),
    person: one(crmPeople, { fields: [cadenceSuggestions.personId], references: [crmPeople.id] }),
    signal: one(abmSignals, { fields: [cadenceSuggestions.signalId], references: [abmSignals.id] }),
}))
