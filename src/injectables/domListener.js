export default function domListener() {
    const {ipcRenderer} = require('electron');

    const observer = new MutationObserver(function(mutationsList, observer) {
        // Handle the observed mutations here
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {

                console.log('mutation detected');

                const downIcon = document.querySelector('[data-icon="chevrons-down"]')
                if (downIcon) {
                    downIcon.closest('.cursor-pointer').click();
                }

            }
        }
    });

    observer.observe(
        document.querySelector('[data-layout-path="/c1/ts1"]'),
    {
        attributes: true,
        childList: true,
        subtree: true, // Set to true to observe descendants as well
        characterData: true // Set to true to observe changes to text content
    });

    // ipcRenderer.on('google-search-change-ack', (_, __) => {
    //     console.log('[Ack]');
    // });

    // searchBar.addEventListener('input', (e) => {
    //     ipcRenderer.send('google-search-change', e.target.value);
    //     console.log('[Google Search]', e.target.value);
    //     // e.target.value = '';
    // });
}
/*
document.querySelector('[data-icon="chevrons-up"]').closest('.cursor-pointer').click();
document.querySelector('[data-icon="chevrons-down"]').closest('.cursor-pointer').click();
* */