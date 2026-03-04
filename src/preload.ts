import {ipcRenderer} from 'electron';

console.log('🚀 Preload injected – fetch override active');

const originalFetch = window.fetch;

window.fetch = async (...args: [any, any]) => {
    const [resource, init = {}] = args;

    const requestInfo = {
        url: typeof resource === 'string' ? resource : resource.url,
        method: init.method || 'GET',
    };

    try {
        const response = await originalFetch(resource, init);
        const cloned = response.clone();

        let body: string;
        const contentType = response.headers.get('content-type') || '';

        console.log(JSON.stringify(response.headers))

        if (contentType.includes('application/json')) {
            body = await cloned.json();
        } else {
            body = await cloned.text();
        }

        ipcRenderer.send('captured-response', {
            timestamp: new Date().toISOString(),
            request: requestInfo,
            response: {
                url: response.url,
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers),
                body,
            },
        });

        return response; // page gets the original response unchanged
    } catch (err) {
        ipcRenderer.send('captured-response', {
            timestamp: new Date().toISOString(),
            request: requestInfo,
            error: err.message,
        });
        throw err;
    }
};