export default function waitForEditorLoad(){

    const {ipcRenderer} = require('electron');

    const checkIfEditorReady = () => {
        if(typeof monaco === 'undefined' || !monaco.editor){
            return null;
        }

        let editorCandidates = monaco.editor.getEditors()
            .map(editor => editor.getModel())
            .filter(model => model && typeof model.getValue !== 'undefined')
            .filter(model => model.getValue().trim().length > 0);

        if (editorCandidates){
            return editorCandidates[0];
        }

        return null;
    }

    ipcRenderer.on('updated-solution', (_, newContent, runTests) => {
        activeEditor.setValue(newContent);
        const runTestsButton = document.querySelector('[data-e2e-locator="console-run-button"]');
        if (runTests && runTestsButton) {
            runTestsButton.click();
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
