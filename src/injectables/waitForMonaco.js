export default function waitForMonaco(){

    const {ipcRenderer} = require('electron');

    new MutationObserver((_, observer) => {
        const editor_classes = document.getElementsByClassName("mtk4");
        if (editor_classes && editor_classes.length > 0 && editor_classes[0].textContent === "class"){
            console.log('app is loaded')
            ipcRenderer.send('app-full-loaded');
            observer.disconnect()
        }
    })
    .observe(document, {
        childList: true,
        attributes: true,
        subtree: true,
        characterData: true
    });
}