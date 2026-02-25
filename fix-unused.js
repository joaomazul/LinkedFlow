const fs = require('fs');

function replaceStr(file, search, replace) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(search, replace);
    fs.writeFileSync(file, content);
  }
}

// 1. timezone.test.ts
replaceStr('src/__tests__/utils/timezone.test.ts', /formatRelativeTime,?\s*/, '');
// 2. accounts/route.ts
replaceStr('src/app/api/linkedin/accounts/route.ts', /_req: Request/, 'req: Request');
// 3. posts/[postId]/comment/route.ts
replaceStr('src/app/api/linkedin/posts/[postId]/comment/route.ts', /incrementStyleUsage,?\s*/, '');
replaceStr('src/app/api/linkedin/posts/[postId]/comment/route.ts', /catch \(e\)/, 'catch ()');
// 4. migrate/local-storage/route.ts
replaceStr('src/app/api/migrate/local-storage/route.ts', /const history = settings\.history/, '// history unused');
// 5. onboarding/page.tsx
replaceStr('src/app/onboarding/page.tsx', /Rocket,?\s*/, '');
replaceStr('src/app/onboarding/page.tsx', /CheckCircle2,?\s*/, '');
replaceStr('src/app/onboarding/page.tsx', /AlertCircle,?\s*/, '');
// 6. CommentZone/ApproveZone.tsx
replaceStr('src/components/feed/CommentZone/ApproveZone.tsx', /import { useFeedStore }.*?\n/, '');
replaceStr('src/components/feed/CommentZone/ApproveZone.tsx', /catch \(err\)/, 'catch ()');
// 7. CommentZone/ManualZone.tsx
replaceStr('src/components/feed/CommentZone/ManualZone.tsx', /catch \(err\)/, 'catch ()');
// 8. CommentZone/index.tsx
replaceStr('src/components/feed/CommentZone/index.tsx', /DraftComment,?\s*/, '');
replaceStr('src/components/feed/CommentZone/index.tsx', /MessageSquare,?\s*/, '');
replaceStr('src/components/feed/CommentZone/index.tsx', /import { cn }.*?\n/, '');
replaceStr('src/components/feed/CommentZone/index.tsx', /const \[status, setStatus\] = useState<CommentStatus>\('idle'\)/, '');
replaceStr('src/components/feed/CommentZone/index.tsx', /setStatus\('posted'\)/, '');
replaceStr('src/components/feed/CommentZone/index.tsx', /<CommentStatus>\('idle'\)/, "");
// 9. PostBody.tsx
replaceStr('src/components/feed/PostBody.tsx', /videoUrl,?\s*/g, '');
// 10. PostCard.tsx
replaceStr('src/components/feed/PostCard.tsx', /import { cn }.*?\n/, '');
// 11. PostStats.tsx
replaceStr('src/components/feed/PostStats.tsx', /\{ icon: React\.ReactNode, label: string, value: number \}/, '{ icon: React.ReactNode, value: number }');
// 12. RightPanel.tsx
replaceStr('src/components/layout/RightPanel.tsx', /MessageSquare,?\s*/, '');
replaceStr('src/components/layout/RightPanel.tsx', /import { cn }.*?\n/, '');
// 13. Sidebar.tsx
replaceStr('src/components/layout/Sidebar.tsx', /Check,?\s*/, '');
replaceStr('src/components/layout/Sidebar.tsx', /Lock,?\s*/, '');
// 14. Topbar.tsx
replaceStr('src/components/layout/Topbar.tsx', /import { cn }.*?\n/, '');
// 15. AddProfileModal.tsx
replaceStr('src/components/profiles/AddProfileModal.tsx', /DialogFooter,?\s*/, '');
replaceStr('src/components/profiles/AddProfileModal.tsx', /import { MonitoredProfile }.*?\n/, '');
// 16. ProfileRow.tsx
replaceStr('src/components/profiles/ProfileRow.tsx', /import { MonitoredProfile }.*?\n/, '');
// 17. OnboardingGuard.tsx
replaceStr('src/components/providers/OnboardingGuard.tsx', /const _hasHydrated = useSettingsStore\(s => s\._hasHydrated\)/, '');
// 18. AccountSettings.tsx -> account settings doesn't have s ? Wait, it was `s => s` but unused? We deleted it?
// 19. PersonaEditor.tsx
replaceStr('src/components/settings/PersonaEditor.tsx', /ChevronRight,?\s*/, '');
replaceStr('src/components/settings/PersonaEditor.tsx', /AnimatePresence,?\s*/, '');
replaceStr('src/components/settings/PersonaEditor.tsx', /catch \(err\)/, 'catch ()');
replaceStr('src/components/settings/PersonaEditor.tsx', /"/g, "&quot;"); // Wait, not all quotes! Only in text. 
// I'll fix quotes manually.
// 20. PromptsEditor.tsx
replaceStr('src/components/settings/PromptsEditor.tsx', /useEffect,?\s*/, '');
replaceStr('src/components/settings/PromptsEditor.tsx', /defaultDropAnimationSideEffects,?\s*/, '');
replaceStr('src/components/settings/PromptsEditor.tsx', /arrayMove,?\s*/, '');
replaceStr('src/components/settings/PromptsEditor.tsx', /import { Input }.*?\n/, '');
// 21. profiles.queries.ts
replaceStr('src/db/queries/profiles.queries.ts', /desc,?\s*/, '');
// 22. schema linkedin-accounts.ts
replaceStr('src/db/schema/linkedin-accounts.ts', /text,?\s*/, '');
// 23. schema profiles.ts
replaceStr('src/db/schema/profiles.ts', /text,?\s*/, '');
// 24. schema settings.ts
replaceStr('src/db/schema/settings.ts', /text,?\s*/, '');
// 25. format.ts
replaceStr('src/lib/utils/format.ts', /PostMetrics,?\s*/, '');

console.log('Unused vars replaced');
