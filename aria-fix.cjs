const fs = require('fs');

function applyAriaFixes(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Fix: Add aria-label to App.tsx inputs
  content = content.replace(
    /(<input[^>]*placeholder="Enter your company domain[^>]*)/g, 
    '$1\n                aria-label="Enter your company domain"'
  );
  content = content.replace(
    /(<input[^>]*placeholder="Your Email Address[^>]*)/g, 
    '$1\n                  aria-label="Your Email Address"'
  );

  // Fix: Add ARIA controls and correct roles to Accordions in App.tsx
  content = content.replace(
    /aria-expanded=\{isOpen\}/g,
    'aria-expanded={isOpen}\n                    aria-controls={`faq-content-${index}`}\n                    id={`faq-button-${index}`}'
  );
  content = content.replace(
    /(<div[\s\S]*className={`grid transition-all)/g,
    '<div \n                    id={`faq-content-${index}`}\n                    role="region"\n                    aria-labelledby={`faq-button-${index}`}\n                    $1'
  );

  // Fix: Improve color contrast for cyan links in light mode 
  content = content.replace(/hover:text-cyan/g, 'hover:text-blue-600 dark:hover:text-cyan');
  content = content.replace(/focus:text-cyan/g, 'focus:text-blue-600 dark:focus:text-cyan');
  // Handle icons and standalone text-cyan where visible on light backgrounds.
  content = content.replace(/className="([^"]*)text-cyan([^"]*)"/g, (match, p1, p2) => {
    // Avoid doubling up if already handled
    if (match.includes('dark:text-cyan')) return match;
    
    // Convert 'text-cyan' to 'text-blue-600 dark:text-cyan'
    return `className="${p1}text-blue-600 dark:text-cyan${p2}"`;
  });

  // Focus visible rings for accessibility on anchor tags
  content = content.replace(/focus:outline-none focus:text-blue-600 dark:focus:text-cyan/g, 'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-cyan focus:text-blue-600 dark:focus:text-cyan rounded-sm');

  fs.writeFileSync(file, content);
}

applyAriaFixes('src/App.tsx');
console.log('App.tsx aria/contrast fixes complete');

function fixChatbot(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // ARIA label for Chat input
  content = content.replace(
    /(<input[^>]*placeholder={isLiveAgent[^>]*)/g,
    '$1\n                  aria-label={isLiveAgent ? "Message Sarah" : "Ask the AI assistant"}'
  );
  
  // Live region for messages
  content = content.replace(
    /<div className="flex-1 overflow-y-auto p-4 space-y-4">/g,
    '<div className="flex-1 overflow-y-auto p-4 space-y-4" aria-live="polite">'
  );

  fs.writeFileSync(file, content);
}
fixChatbot('src/components/Chatbot.tsx');
console.log('Chatbot.tsx aria fixes complete');

function fixThreatFeed(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // aria-pressed & label on pause button
  content = content.replace(
    /<button([\s\S]*onClick=\{\(\) => setIsPaused\(!isPaused\)\})/g,
    '<button$1\n            aria-label={isPaused ? "Resume Live Feed" : "Pause Live Feed"}\n            aria-pressed={isPaused}'
  );

  // Focus visible on pause button
  content = content.replace(
    /focus:outline-none/g,
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan rounded'
  );

  // Add aria-live to feed list
  content = content.replace(
    /<div className="p-4 h-\[500px\] overflow-y-auto/g,
    '<div aria-live="polite" aria-atomic="false" className="p-4 h-[500px] overflow-y-auto'
  );

  fs.writeFileSync(file, content);
}
fixThreatFeed('src/components/LiveThreatFeed.tsx');
console.log('LiveThreatFeed.tsx aria fixes complete');

