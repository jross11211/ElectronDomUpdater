export default function waitForEditorLoad(){

    const {ipcRenderer} = require('electron');

    const testContainer = document.querySelector("[data-layout-path='/c1/ts1/t1']");
    let last_state_str = testContainer.textContent;

    const testPanelObserver = new MutationObserver(() => {
        if (testContainer.textContent !== last_state_str){
            const testContainerStr = testContainer.textContent;
            console.log(testContainerStr);
            ipcRenderer.send('tests-updated', testContainerStr);
            last_state_str = testContainerStr;
        }
    });
    testPanelObserver.observe(testContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
    });

    let cachedEditor = null;
    const findEditor = () => {

        if (cachedEditor) {
            return cachedEditor;
        }

        if(typeof monaco === 'undefined' || !monaco.editor){
            return null;
        }

        const editors = monaco.editor.getEditors();
        for (const editor of editors) {
            const model = editor.getModel();
            if (model && model.getValue().trim().length > 0) {
                cachedEditor = model;
                return model;
            }
        }

        return null;
    }

    ipcRenderer.on('updated-solution', (_, newContent, runTests) => {
        const model = findEditor();
        console.log('Code updated:', newContent);
        model.setValue(newContent);

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

    const observer = new MutationObserver(() => {
        if (findEditor() !== null){

            console.log(findEditor().getValue());

            const slug = window.location.pathname.split('/problems/')[1]?.replace(/\/+$/, '') ?? 'unknown';
            ipcRenderer.send('app-fully-loaded', findEditor().getValue(), slug.split('/')[0]);

            observer.disconnect()
        }
    });

    observer.observe(document, {
        childList: true,
        subtree: true
    });
}
