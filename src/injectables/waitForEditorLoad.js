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
        console.log('ipc - [updated-solution] - (newContent, runTests)', newContent, runTests);
        activeEditor.setValue(newContent);
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

    let activeEditor = null;
    const observer = new MutationObserver(() => {

        activeEditor = checkIfEditorReady();

        if (activeEditor){
            console.log('[startup] - Active editor is ready!');

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
