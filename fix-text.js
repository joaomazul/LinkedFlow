const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src/db/schema');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

for (const file of files) {
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');

    let newContent = content.replace(/text(\([^,]+,\s*\{\s*length:\s*\d+\s*\}\))/g, 'varchar$1');

    if (newContent !== content) {
        if (!newContent.match(/import\s*\{[^}]*varchar[^}]*\}\s*from\s*'drizzle-orm\/pg-core'/)) {
            newContent = newContent.replace(/import\s*\{([^\}]+)\}\s*from\s*'drizzle-orm\/pg-core'/, (m, p1) => {
                return `import { ${p1.trim()}, varchar } from 'drizzle-orm/pg-core'`;
            });
        }
        fs.writeFileSync(fullPath, newContent);
        console.log('Fixed:', file);
    }
}
