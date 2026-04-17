const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace backgrounds
content = content.replace(/bg-black/g, 'bg-white dark:bg-black');
content = content.replace(/bg-\[\#0A0A0A\]/g, 'bg-gray-50 dark:bg-[#0A0A0A]');
content = content.replace(/bg-\[\#050505\]/g, 'bg-gray-100 dark:bg-[#050505]');
content = content.replace(/bg-\[\#111\]/g, 'bg-gray-200 dark:bg-[#111]');

// Replace text colors
content = content.replace(/text-white/g, 'text-black dark:text-white');
content = content.replace(/text-offwhite/g, 'text-black dark:text-offwhite');
content = content.replace(/text-neutral-400/g, 'text-neutral-600 dark:text-neutral-400');
content = content.replace(/text-neutral-500/g, 'text-neutral-500 dark:text-neutral-500');

// Replace borders
content = content.replace(/border-white\/5/g, 'border-black/5 dark:border-white/5');
content = content.replace(/border-white\/10/g, 'border-black/10 dark:border-white/10');
content = content.replace(/border-white\/20/g, 'border-black/20 dark:border-white/20');
content = content.replace(/border-white\/50/g, 'border-black/50 dark:border-white/50');
content = content.replace(/border-white/g, 'border-black dark:border-white');

// Resolve edge cases from double replacements
content = content.replace(/text-black dark:text-black dark:text-white/g, 'text-black dark:text-white');
content = content.replace(/text-black dark:text-black dark:text-offwhite/g, 'text-black dark:text-offwhite');
content = content.replace(/border-black dark:border-black\/([0-9]+) dark:border-white\/([0-9]+)/g, 'border-black/$1 dark:border-white/$2');

// Fix buttons text in light mode
content = content.replace(/bg-transparent border border-black dark:border-white text-black dark:text-white hover:bg-white\/10/g, 'bg-transparent border border-black dark:border-white text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10');
content = content.replace(/text-black dark:text-navy/g, 'text-white dark:text-navy'); // Cyan button text should stay white/navy
content = content.replace(/focus:ring-white focus:ring-offset-black dark:focus:ring-offset-black/g, 'focus:ring-black dark:focus:ring-white focus:ring-offset-white dark:focus:ring-offset-black');

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx migrated successfully');
