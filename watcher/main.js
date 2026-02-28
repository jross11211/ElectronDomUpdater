const fs = require('fs');
const WebSocket = require('ws');

const web_socket = new WebSocket('ws://localhost:8080');

web_socket.on('open', () => {
    console.log('Connected to Electron');
});

let lastContent = '';
fs.watch('./live_codespace/solution.py', (event, filename) => {  // swap to your file
    if (event === 'change') {
        const content = fs.readFileSync('./live_codespace/solution.py', 'utf8');
        if (content !== lastContent) {
            console.log('Code updated:', content);
            web_socket.send(JSON.stringify({ type: 'code-update', code: content }));
            lastContent = content;
        }
    }
});