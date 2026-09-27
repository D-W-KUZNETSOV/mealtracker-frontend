// scripts/bump-sw-version.js
// Автоматически увеличивает CACHE_VERSION в service-worker.js
// Запуск: node scripts/bump-sw-version.js

const fs = require('fs');
const path = require('path');

const swPath = path.join(__dirname, '..', 'public', 'service-worker.js');

if (!fs.existsSync(swPath)) {
  console.error('❌ service-worker.js not found at', swPath);
  process.exit(1);
}

let content = fs.readFileSync(swPath, 'utf8');

// Ищем текущую версию
const match = content.match(/CACHE_VERSION\s*=\s*['"]v(\d+)['"]/);
if (!match) {
  console.error('❌ CACHE_VERSION not found in service-worker.js');
  process.exit(1);
}

const currentVersion = parseInt(match[1], 10);
const nextVersion = currentVersion + 1;

content = content.replace(
  /CACHE_VERSION\s*=\s*['"]v\d+['"]/,
  `CACHE_VERSION = 'v${nextVersion}'`
);

fs.writeFileSync(swPath, content, 'utf8');

console.log(`✅ CACHE_VERSION bumped: v${currentVersion} → v${nextVersion}`);