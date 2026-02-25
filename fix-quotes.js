const fs = require('fs');
let file = 'src/components/settings/PersonaEditor.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/&quot;/g, '"'); // restore all
// Now correctly fix lines 188 and 248 manually by escaping the quotes
content = content.replace(/Ex: "(.*?)", "(.*?)"\./, 'Ex: &quot;$1&quot;, &quot;$2&quot;.');
content = content.replace(/"\{EXAMPLE_POST\.text\}"/, '&quot;{EXAMPLE_POST.text}&quot;');
fs.writeFileSync(file, content);
console.log('Fixed quotes in PersonaEditor!');
