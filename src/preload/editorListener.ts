import {ipcRenderer} from 'electron';
import logger from "../utils/logger.ts";
import {IPC_EVENTS} from "../config/constants.ts";

declare var monaco: any;

const checkIfEditorReady = () => {
    if (typeof monaco === 'undefined' || !monaco.editor) return null;

    const candidates = monaco.editor.getEditors()
        .map((editor: any) => editor.getModel())
        .filter((model: any) => model && typeof model.getValue !== 'undefined')
        .filter((model: any) => model.getValue().trim().length > 0);

    return candidates[0] ?? null;
}

let activeEditor: any = null;

ipcRenderer.on(IPC_EVENTS.EDITED_SOLUTION, (_, newContent, runTests) => {
    logger.trace('updated-solution', `Received (runTests=${runTests})`);
    activeEditor?.setValue(newContent);
    if (runTests) {
        const runTestsButton = document.querySelector('[data-e2e-locator="console-run-button"]');
        if (runTestsButton) {
            logger.trace('updated-solution', 'Clicking Run button');
            (runTestsButton as HTMLElement).click();
        }
    }
});

const observer = new MutationObserver(() => {
    activeEditor = checkIfEditorReady();
    if (activeEditor) {
        logger.trace('startup', 'Monaco editor ready, sending APP_FULLY_LOADED');
        const slug = window.location.pathname.split('/problems/')[1]?.replace(/\/+$/, '') ?? 'unknown';
        ipcRenderer.send(IPC_EVENTS.APP_FULLY_LOADED, activeEditor.getValue(), slug.split('/')[0]);
        observer.disconnect();
    }
});

observer.observe(document, { childList: true, subtree: true });
