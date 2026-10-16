import fs from 'fs';

const html = fs.readFileSync('prototype.html', 'utf8');
console.log('--- PROTOTYPE VERIFICATION ---');
console.log('Total file size:', (html.length / (1024 * 1024)).toFixed(2), 'MB');
console.log('Has <div id="root"></div>:', html.includes('<div id="root"></div>'));
console.log('Has <style> tag:', html.includes('<style>'));
console.log('Has <script type="module"> tag:', html.includes('<script type="module">'));
console.log('Has </script> tag:', html.includes('</script>'));
console.log('Root index:', html.indexOf('<div id="root"></div>'));
console.log('Script index:', html.indexOf('<script type="module">'));
console.log('Is root before script:', html.indexOf('<div id="root"></div>') < html.indexOf('<script type="module">'));
console.log('Has Base64 image data:', html.includes('data:image/png;base64,'));
console.log('Has Admin CMS button in HTML:', html.includes('Admin CMS Dashboard') || html.includes('Unlock CMS Dashboard'));
console.log('Has Hero Video URL:', html.includes('3672a88bb9317e951a2e21c14b61408bf35051c5fdc8c06c72ee4b7a60846161.mp4'));
console.log('Has Rolex Collection:', html.includes('Submariner') && html.includes('Rolex'));
console.log('Has QuickView Modal code:', html.includes('ProductQuickViewModal') || html.includes('Order via WhatsApp'));
