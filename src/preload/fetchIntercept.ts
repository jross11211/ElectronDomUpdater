import {ipcRenderer} from 'electron';
import logger from "../utils/logger.ts";
import {IPC_EVENTS} from "../config/constants.ts";

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
                logger.trace('tests-updated', 'Test results received from LeetCode, sending to main');
                ipcRenderer.send(IPC_EVENTS.TEST_RESULTS_ARRIVED, body);
            }
        })
        .catch(console.error);

    return response;
};
