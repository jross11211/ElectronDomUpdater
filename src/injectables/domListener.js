export default function domListener() {
    const {ipcRenderer} = require('electron');
    const searchBar = document.querySelector('input[name="q"], textarea[name="q"]');

    ipcRenderer.on('google-search-change-ack', (_, __) => {
        console.log('[Ack]');
    });

    searchBar.addEventListener('input', (e) => {
        ipcRenderer.send('google-search-change', e.target.value);
        console.log('[Google Search]', e.target.value);
        // e.target.value = '';
    });
}
