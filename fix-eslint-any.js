const fs = require('fs');
const files = [
  'src/app/api/ai/generate-comment/route.ts',
  'src/app/api/cron/cleanup/route.ts',
  'src/app/api/health/route.ts',
  'src/app/api/linkedin/account-status/route.ts',
  'src/app/api/linkedin/feed/route.ts',
  'src/app/api/linkedin/posts/[postId]/comment/route.ts',
  'src/app/api/migrate/local-storage/route.ts',
  'src/app/api/settings/persona/route.ts',
  'src/app/onboarding/page.tsx',
  'src/components/feed/CommentZone/AIPanel.tsx',
  'src/components/feed/FeedContainer.tsx',
  'src/components/layout/RightPanel.tsx',
  'src/components/providers/OnboardingGuard.tsx',
  'src/components/settings/AccountSettings.tsx',
  'src/hooks/useFeed.ts',
  'src/hooks/useGenerateComment.ts',
  'src/lib/openrouter/client.ts',
  'src/lib/unipile/account-status.ts',
  'src/lib/unipile/client.ts',
  'src/lib/unipile/error-messages.ts',
  'src/lib/unipile/posts.ts'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/catch \((error|err|e): any\)/g, "catch ($1: unknown)");
  content = content.replace(/err: any/g, "err: unknown");
  content = content.replace(/error: any/g, "error: unknown");
  content = content.replace(/e: any/g, "e: unknown");
  content = content.replace(/s: any/g, "s: unknown");
  content = content.replace(/state: any/g, "state: unknown");
  content = content.replace(/Error\): any/g, "Error): unknown"); // For error-messages.ts?
  fs.writeFileSync(file, content);
}
console.log('Fixed simple any');
