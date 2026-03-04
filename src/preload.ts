import fs from 'fs';
import path from 'node:path';
import parseTestResults, { TestResult } from './utils/parseTestResults.ts';

console.log('🚀 Preload injected – fetch override active');

const projectRoot = process.cwd();
const logDir = path.join(projectRoot, 'network-logs');
const testsOutputPath = path.join(projectRoot, '_live_code', 'tests_output.txt');
fs.mkdirSync(logDir, { recursive: true });
fs.mkdirSync(path.dirname(testsOutputPath), { recursive: true });
console.log('* network log dir =', logDir);

const SEPARATOR = '--------------------------------------------------------------';
let counter = 0;

function formatTestResult(t: TestResult): string {
    const status = t.passed ? 'PASSED' : 'FAILED';
    let out = `Test ${t.testIndex + 1}: ${status}\n`;
    out += `  Answer:   ${t.answer}\n`;
    out += `  Expected: ${t.expectedAnswer}\n`;
    if (t.stdout) out += `  Stdout:\n${t.stdout.trimEnd().split('\n').map(l => `    ${l}`).join('\n')}\n`;
    if (t.expectedStdout) out += `  Expected Stdout:\n${t.expectedStdout.trimEnd().split('\n').map(l => `    ${l}`).join('\n')}\n`;
    return out;
}

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
            let body: any;
            if (contentType.includes('application/json')) {
                body = await cloned.json();
            } else if (contentType.includes('text/')) {
                body = await cloned.text();
            } else {
                body = `[binary: ${contentType}]`;
            }
            if (!body || !body.status_runtime) return;

            const data = {
                timestamp: new Date().toISOString(),
                request: requestInfo,
                response: {
                    url: response.url,
                    status: response.status,
                    statusText: response.statusText,
                    headers: JSON.stringify(response.headers),
                    body,
                },
            };

            const ts = new Date().toISOString().replace(/[:.]/g, '-');
            const method = (requestInfo.method ?? 'UNKNOWN').toUpperCase();
            const urlSlug = (requestInfo.url ?? 'unknown')
                .replace(/^https?:\/\//, '')
                .replace(/[^a-zA-Z0-9_\-]/g, '_')
                .slice(0, 80);
            const idx = String(counter++).padStart(4, '0');
            const rawFilename = `${ts}_${idx}_${method}_${urlSlug}.json`;
            const parsedFilename = `${ts}_${idx}_${method}_${urlSlug}_parsed.json`;

            fs.writeFile(path.join(logDir, rawFilename), JSON.stringify(data, null, 2), { encoding: 'utf-8' }, (err) => {
                if (err) console.error('[Network] Failed to write log:', err);
            });

            const testResults = parseTestResults(data);
            fs.writeFile(path.join(logDir, parsedFilename), JSON.stringify(testResults, null, 2), { encoding: 'utf-8' }, (err) => {
                if (err) console.error('[Network] Failed to write parsed log:', err);
            });

            // Write combined test output
            const header = `${body.pretty_lang ?? ''} | ${body.status_runtime ?? ''} | ${body.status_memory ?? ''} | ${body.total_correct ?? 0}/${body.total_testcases ?? 0} passed\n`;
            const testsOutput = header + SEPARATOR + '\n' +
                testResults.map(formatTestResult).join(SEPARATOR + '\n');

            fs.writeFile(testsOutputPath, testsOutput, { encoding: 'utf-8' }, (err) => {
                if (err) console.error('[Network] Failed to write tests output:', err);
            });

            console.log('[Network]', method, requestInfo.url, '->', response.status, `→ ${rawFilename}`);
            console.log('[Parsed]', `${testResults.length} test results → ${parsedFilename}`);
        })()
        .catch(console.error);

        return response;
    } catch (err) {
        throw err;
    }
};