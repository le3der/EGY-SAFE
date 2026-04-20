import('lucide-react').then(lucide => {
  const icons = ['Fish', 'Hook', 'Skull', 'DoorOpen', 'VenetianMask', 'MailWarning', 'Zap', 'Database', 'Key', 'Bug', 'Lock'];
  icons.forEach(i => {
    console.log(i + ' exists: ' + (!!lucide[i]));
  });
}).catch(console.error);
