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

    ipcRenderer.on('updated-solution', (_, newContent, runTests) => {
        const model = monaco.editor.getModels()[0];
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
        if (typeof monaco !== 'undefined' && monaco.editor && monaco.editor.getEditors().length > 0 && monaco.editor.getEditors()[0].getValue()){

            console.log(monaco.editor.getEditors()[0].getValue());

            const slug = window.location.pathname.split('/problems/')[1]?.replace(/\/+$/, '') ?? 'unknown';
            ipcRenderer.send('app-fully-loaded', monaco.editor.getEditors()[0].getValue(), slug.split('/')[0]);

            observer.disconnect()
        }
    });

    observer.observe(document, {
        childList: true,
        subtree: true
    });
}
