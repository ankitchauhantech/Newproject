const fs = require('fs');
let code = fs.readFileSync('routes/admin.js', 'utf8');
code = code.replace(/res\.render\(['"]admin\/([\w-]+)['"],\s*\{/g, 'res.render("admin/$1", { layout: "admin/layout",');
fs.writeFileSync('routes/admin.js', code);
