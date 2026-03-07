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

        if (editorCandidates.length){
            return editorCandidates[0];
        }

        return null;
    }

    ipcRenderer.on(ipcChannels.IPC_UPDATED_SOLUTION, (_, newContent, runTests) => {
        console.log('[updated-solution] Received in renderer, runTests:', runTests);
        activeEditor.setValue(newContent);
        console.log('[updated-solution] Editor updated');
        if (runTests) {
            const runTestsButton = document.querySelector('[data-e2e-locator="console-run-button"]');
            if (runTestsButton) {
                console.log('[updated-solution] Clicking Run button');
                runTestsButton.click();
            } else {
                console.error('[updated-solution] Run button not found');
            }
        }
    });

    ipcRenderer.on(ipcChannels.IPC_RUN_CODE, () => {
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
            ipcRenderer.send(ipcChannels.IPC_APP_FULLY_LOADED, activeEditor.getValue(), slug.split('/')[0]);

            observer.disconnect()
        }
    });

    observer.observe(document, {
        childList: true,
        subtree: true
    });
}
