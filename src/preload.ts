import fs from 'fs';
import path from 'node:path';
import parseTestResults, { TestResult } from './utils/parseTestResults.ts';

console.log('🚀 Preload injected – fetch override active');

const projectRoot = process.cwd();
const testsOutputPath = path.join(projectRoot, '_live_code', 'tests_output.txt');
fs.mkdirSync(path.dirname(testsOutputPath), { recursive: true });

const SEPARATOR = '--------------------------------------------------------------';

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

    const requestUrl = typeof resource === 'string' ? resource : resource.url;

    try {
        const response = await originalFetch(resource, init);

        if (!requestUrl.includes('/submissions/detail/')) return response;

        const cloned = response.clone();
        const contentType = response.headers.get('content-type') || '';

        (async () => {
            let body: any;
            if (contentType.includes('application/json')) {
                body = await cloned.json();
            } else {
                return;
            }
            if (!body || !body.status_runtime) return;

            const testResults = parseTestResults(body);

            const header = `${body.pretty_lang ?? ''} | ${body.status_runtime ?? ''} | ${body.status_memory ?? ''} | ${body.total_correct ?? 0}/${body.total_testcases ?? 0} passed\n`;
            const testsOutput = header + SEPARATOR + '\n' +
                testResults.map(formatTestResult).join(SEPARATOR + '\n');

            fs.writeFile(testsOutputPath, testsOutput, { encoding: 'utf-8' }, (err) => {
                if (err) console.error('[Network] Failed to write tests output:', err);
            });

            console.log('[Tests]', `${body.total_correct}/${body.total_testcases} passed → _live_code/tests_output.txt`);
        })().catch(console.error);

        return response;
    } catch (err) {
        throw err;
    }
};
