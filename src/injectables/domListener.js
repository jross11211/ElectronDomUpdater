export default function domListener() {
    const {ipcRenderer} = require('electron');

    ipcRenderer.on('updated-solution', (_, newContent) => {
        console.log(newContent)
        const model = monaco.editor.getModels()[0];
        model.setValue(newContent);
        console.log('✅ Code set successfully!');
    });
}
/*
document.querySelector('[data-icon="chevrons-up"]').closest('.cursor-pointer').click();
document.querySelector('[data-icon="chevrons-down"]').closest('.cursor-pointer').click();
* */