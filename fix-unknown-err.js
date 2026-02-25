const fs = require('fs');

function replace(file, search, replaceStr) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(search, replaceStr);
    fs.writeFileSync(file, content);
  }
}

// 1. cron/cleanup/route.ts
replace('src/app/api/cron/cleanup/route.ts', /err\.message/g, '(err as Error).message');
// 2. account-status/route.ts
replace('src/app/api/linkedin/account-status/route.ts', /e\.message/g, '(e as Error).message');
// 4. AIPanel.tsx
replace('src/components/feed/CommentZone/AIPanel.tsx', /err\.name/g, '(err as Error).name');
// 6. useGenerateComment.ts
replace('src/hooks/useGenerateComment.ts', /err\.name/g, '(err as Error).name');
// 7. openrouter/client.ts
replace('src/lib/openrouter/client.ts', /err\.name/g, '(err as Error).name');
// 8. unipile/account-status.ts
replace('src/lib/unipile/account-status.ts', /e\.message/g, '(e as Error).message');
// 9. unipile/client.ts
replace('src/lib/unipile/client.ts', /err\.name/g, '(err as Error).name');

// 3. feed/route.ts
// The map has: `map((item: unknown) => ...)`
replace('src/app/api/linkedin/feed/route.ts', /map\(\(item: unknown\) =>/g, 'map((item: Record<string, unknown>) =>');
replace('src/app/api/linkedin/feed/route.ts', /item\.id/g, 'String(item.id)');
replace('src/app/api/linkedin/feed/route.ts', /item\.text/g, 'String(item.text)');
// Instead of replacing every single property, I will change `const data = (unipileResponse.items as unknown[]).map((item: unknown) => ({`
// to `const data = (unipileResponse.items as Record<string, unknown>[]).map((item) => ({`
// Then inside map, it still errors unless I do a proper cast. Let me just replace the entire map.
let feedRouteFile = 'src/app/api/linkedin/feed/route.ts';
if (fs.existsSync(feedRouteFile)) {
    let content = fs.readFileSync(feedRouteFile, 'utf8');
    content = content.replace(/map\(\(item: unknown\)/, 'map((item: any)'); // Wait, user wants ZERO any!
    // I can type item as:
    content = content.replace(/item: unknown/g, "item: { id?: string, text?: string, attachments?: { url: string }[], reaction_count?: number, comment_count?: number, repost_count?: number, timestamp?: number | string }");
    fs.writeFileSync(feedRouteFile, content);
}

