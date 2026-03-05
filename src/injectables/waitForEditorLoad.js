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

    ipcRenderer.on('updated-solution', (_, newContent) => {
        const model = monaco.editor.getModels()[0];
        console.log('Code updated:', newContent);
        model.setValue(newContent);
    });

    const observer = new MutationObserver(() => {
        if (monaco && monaco.editor && monaco.editor.getEditors().length > 0 && monaco.editor.getEditors()[0].getValue()){

            console.log(monaco.editor.getEditors()[0].getValue());

            ipcRenderer.send('app-fully-loaded', monaco.editor.getEditors()[0].getValue());

            observer.disconnect()
        }
    });

    observer.observe(document, {
        childList: true,
        subtree: true
    });
}
