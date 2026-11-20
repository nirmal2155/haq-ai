import fs from 'fs';
fs.copyFileSync('src/i18n/en.json', 'src/lib/i18n/en.json');
fs.copyFileSync('src/i18n/hi.json', 'src/lib/i18n/hi.json');
fs.copyFileSync('src/i18n/gu.json', 'src/lib/i18n/gu.json');
console.log('Synced i18n catalogs');
