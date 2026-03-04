import {ipcRenderer} from 'electron';

console.log('🚀 Preload injected – fetch override active');

const originalFetch = window.fetch;

window.fetch = async (...args: [any, any]) => {
    const [resource, init = {}] = args;

    let requestBody: any = undefined;
    if (init.body !== undefined && init.body !== null) {
        try {
            requestBody = JSON.parse(init.body);
        } catch {
            requestBody = init.body;
        }
    }

    const requestInfo = {
        url: typeof resource === 'string' ? resource : resource.url,
        method: init.method || 'GET',
        headers: init.headers ?? {},
        body: requestBody,
    };

    try {
        const response = await originalFetch(resource, init);
        const cloned = response.clone();
        const contentType = response.headers.get('content-type') || '';

        // Only log submission check requests
        const url = requestInfo.url;
        if (!url.includes('/submissions/detail/')) return response;

        (async () => {
            try {
                let body: any;
                if (contentType.includes('application/json')) {
                    body = await cloned.json();
                } else if (contentType.includes('text/')) {
                    body = await cloned.text();
                } else {
                    body = `[binary: ${contentType}]`;
                }
                if (!body || !body.status_runtime) return;

                ipcRenderer.send('captured-response', {
                    timestamp: new Date().toISOString(),
                    request: requestInfo,
                    response: {
                        url: response.url,
                        status: response.status,
                        statusText: response.statusText,
                        headers: JSON.stringify(response.headers),
                        body,
                    },
                });
            } catch (e) {
                // don't let logging errors affect the page
            }
        })()
        .catch(console.error);

        return response;
    } catch (err) {
        ipcRenderer.send('captured-response', {
            timestamp: new Date().toISOString(),
            request: requestInfo,
            error: err.message,
        });
        throw err;
    }
};