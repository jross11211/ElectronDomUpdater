import {ipcRenderer} from 'electron';
import logger from "./utils/logger.ts";
import {ipcChannels} from "./config/constants.ts";

// @ts-ignore
window.ipcChannels = ipcChannels;

// Intercept fetch to capture LeetCode submission results
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
