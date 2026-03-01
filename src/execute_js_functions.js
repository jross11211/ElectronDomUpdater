export function google_search_listener() {
    const {ipcRenderer} = require('electron');
    const searchBar = document.querySelector('input[name="q"], textarea[name="q"]');

    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            ipcRenderer.send('google-search-change', e.target.value);
            console.log('[Google Search]', e.target.value);
            e.target.value = '';
        });
    }
}

export function log_to_window(args) {
    console.log(args['message']);
}
