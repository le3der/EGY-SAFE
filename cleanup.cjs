const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Fix accidental double dark border prefixes
content = content.replace(/border-black dark:border-black dark:border-white\/([0-9]+)/g, 'border-black/$1 dark:border-white/$1');
content = content.replace(/border-black\/([0-9]+) dark:border-black dark:border-white\/([0-9]+)/g, 'border-black/$1 dark:border-white/$2');
content = content.replace(/border-black dark:border-white\/50/g, 'border-black/50 dark:border-white/50');
content = content.replace(/border-black dark:border-white\/20/g, 'border-black/20 dark:border-white/20');
content = content.replace(/border-black dark:border-white\/10/g, 'border-black/10 dark:border-white/10');
content = content.replace(/border-black dark:border-white\/5/g, 'border-black/5 dark:border-white/5');

// Fix offwhite double logic
content = content.replace(/text-black dark:text-black dark:text-offwhite/g, 'text-black dark:text-offwhite');
content = content.replace(/text-black dark:text-offwhite\/([0-9]+)/g, 'text-black/70 dark:text-offwhite/$1'); // Approximation for /30

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx cleanup complete');
