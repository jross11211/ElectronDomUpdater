export default function waitForEditorLoad(){

    const {ipcRenderer} = require('electron');

    const checkIfEditorReady = () => {
        if(typeof monaco === 'undefined' || !monaco.editor){
            return null;
        }
        const editors = monaco.editor.getEditors();
        for (const editor of editors) {
            const model = editor.getModel();
            if (model && model.getValue().trim().length > 0) {
                return editor;
            }
        }
        return null;
    }

    ipcRenderer.on('updated-solution', (_, newContent, runTests) => {
        console.log('Code updated:', newContent);
        activeEditor.setValue(newContent);

        if (runTests) {
            const runBtn = document.querySelector('[data-e2e-locator="console-run-button"]');
            if (runBtn) {
                console.log('Clicking Run button');
                runBtn.click();
            } else {
                console.error('Run button not found');
            }
        }
    });

    ipcRenderer.on('run-code', () => {
        const runBtn = document.querySelector('[data-e2e-locator="console-run-button"]');
        if (runBtn) {
            console.log('Clicking Run button');
            runBtn.click();
        } else {
            console.error('Run button not found');
        }
    });

    let activeEditor = null;
    const observer = new MutationObserver(() => {

        activeEditor = checkIfEditorReady();

        if (activeEditor){

            console.log(activeEditor.getValue());

            const slug = window.location.pathname.split('/problems/')[1]?.replace(/\/+$/, '') ?? 'unknown';
            ipcRenderer.send('app-fully-loaded', activeEditor.getValue(), slug.split('/')[0]);

            observer.disconnect()
        }
    });

    observer.observe(document, {
        childList: true,
        subtree: true
    });
}
