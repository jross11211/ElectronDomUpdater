import {ipcRenderer} from 'electron';
import logger from "./utils/logger.ts";
import {ipcChannels} from "./config/constants.ts";

// -------- Monaco editor detection --------

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

ipcRenderer.on(ipcChannels.IPC_UPDATED_SOLUTION, (_, newContent, runTests) => {
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
        logger.trace('startup', 'Monaco editor ready, sending IPC_APP_FULLY_LOADED');
        const slug = window.location.pathname.split('/problems/')[1]?.replace(/\/+$/, '') ?? 'unknown';
        ipcRenderer.send(ipcChannels.IPC_APP_FULLY_LOADED, activeEditor.getValue(), slug.split('/')[0]);
        observer.disconnect();
    }
});

observer.observe(document, { childList: true, subtree: true });

// -------- Fetch intercept for test results --------

const originalFetch = window.fetch;

window.fetch = async (...args: [any, any]) => {
    const [resource, init = {}] = args;
    const response = await originalFetch(resource, init);

    const url = typeof resource === 'string' ? resource : resource.url;
    if (!url.includes('/submissions/detail/')) return response;

    const cloned = response.clone();
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return response;

    cloned.json()
        .then(body => {
            if (body?.status_runtime) {
                ipcRenderer.send(ipcChannels.IPC_TESTS_UPDATED, body);
                logger.trace(ipcChannels.IPC_TESTS_UPDATED, 'Test rests received from LeetCode.com! Saving...');
            }
        })
        .catch(console.error);

    return response;
};
