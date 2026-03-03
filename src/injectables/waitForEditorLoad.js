import {ipcRenderer} from "electron";

export default function waitForEditorLoad(){

    const {ipcRenderer} = require('electron');

    ipcRenderer.on('updated-solution', (_, newContent) => {
        const model = monaco.editor.getModels()[0];
        console.log('Code updated:', newContent);
        model.setValue(newContent);
    });

    const observer = new MutationObserver(() => {
        const editor_classes = document.getElementsByClassName("mtk4");
        if (editor_classes.length > 0){

            ipcRenderer.send('app-fully-loaded');

            observer.disconnect()
        }
    });

    observer.observe(document, {
        childList: true,
        attributes: true,
        subtree: true,
        characterData: true
    });
}
