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
        const editor_classes = document.getElementsByClassName("mtk4");
        if (editor_classes.length > 0){

            ipcRenderer.send('app-fully-loaded');

            observer.disconnect()
        }
    });

    observer.observe(document, {
        childList: true,
        subtree: true
    });
}
