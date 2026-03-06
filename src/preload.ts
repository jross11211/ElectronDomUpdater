import {ipcRenderer} from 'electron';
import fs from 'fs';
import path from 'node:path';

const TESTS_OUTPUT_PATH = path.join(process.cwd(), '_live_code', 'tests_output.txt');

fs.mkdirSync(path.dirname(TESTS_OUTPUT_PATH), { recursive: true });

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
                ipcRenderer.sendSync('tests-updated', body);
            }
        })
        .catch(console.error);

    return response;
};
