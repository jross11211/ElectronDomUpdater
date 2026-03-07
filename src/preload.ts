import {ipcRenderer} from 'electron';
import ipcChannels from "./injectables/ipcChannels.js";

// Intercept fetch to capture LeetCode submission results
const originalFetch = window.fetch;

window.fetch = async (...args: [any, any]) => {
    const [resource, init = {}] = args;
    const response = await originalFetch(resource, init);

    const url = typeof resource === 'string' ? resource : resource.url;
    if (!url.includes('/submissions/detail/')) return response;

    console.log('[tests-updated] /submissions/detail/ intercepted:', url);

    const cloned = response.clone();
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return response;

    cloned.json()
        .then(body => {
            if (body?.status_runtime) {
                ipcRenderer.send(ipcChannels.IPC_TESTS_UPDATED, body);
                console.log('[tests-updated] Sent to main', body);
            }
        })
        .catch(console.error);

    return response;
};
