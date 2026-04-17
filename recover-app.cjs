const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Undo the greedy <div> destruction 
content = content.replace(
  /<div \n                    id=\{`faq-content-\$\{index\}`\}\n                    role="region"\n                    aria-labelledby=\{`faq-button-\$\{index\}`\}\n                    (<div className="min-h-screen bg-white[\s\S]*?)<div (className=\{`grid transition-all)/,
  '$1<div \n                    id={`faq-content-${index}`}\n                    role="region"\n                    aria-labelledby={`faq-button-${index}`}\n                    $2'
);

// Fix the input destructions if they happened
content = content.replace(
  /(<input[^>]*placeholder="Enter your company domain[^>]*)\n                aria-label="Enter your company domain"/g,
  '$1 aria-label="Enter your company domain"'
);

content = content.replace(
  /(<input[^>]*placeholder="Your Email Address[^>]*)\n                  aria-label="Your Email Address"/g,
  '$1 aria-label="Your Email Address"'
);

// I will just use careful replacements
fs.writeFileSync('src/App.tsx', content);

console.log("recovery script ready");
