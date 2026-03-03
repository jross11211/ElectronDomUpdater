export default function waitForEditorLoad(){

    const {ipcRenderer} = require('electron');

    new MutationObserver((_, observer) => {
        const editor_classes = document.getElementsByClassName("mtk4");
        if (editor_classes.length > 0){

            ipcRenderer.on('updated-solution', (_, newContent) => {
                const model = monaco.editor.getModels()[0];
                model.setValue(newContent);
            });

            ipcRenderer.send('app-full-loaded');
            observer.disconnect()
        }
    })
    .observe(document, { childList: true });
}
