const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'views/admin');

fs.readdirSync(dir).forEach(file => {
  if (file !== 'layout.ejs' && file.endsWith('.ejs')) {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    content = content.replace(/<%- include\(['"]\.?\/layout['"],\s*\{\s*body:\s*`/g, '').replace(/`\s*\}\)\s*%>/g, '');
    fs.writeFileSync(path.join(dir, file), content.trim());
    console.log('Fixed ' + file);
  }
});
