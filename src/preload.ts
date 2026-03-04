import fs from 'fs';
import path from 'node:path';
import parseTestResults, { TestResult } from './utils/parseTestResults.ts';

const TESTS_OUTPUT_PATH = path.join(process.cwd(), '_live_code', 'tests_output.txt');
const SEPARATOR = '--------------------------------------------------------------';

fs.mkdirSync(path.dirname(TESTS_OUTPUT_PATH), { recursive: true });

function formatTestResult(t: TestResult): string {
    const status = t.passed ? 'PASSED' : 'FAILED';
    let out = `Test ${t.testIndex + 1}: ${status}\n`;
    out += `  Answer:   ${t.answer}\n`;
    out += `  Expected: ${t.expectedAnswer}\n`;

    let expectedStdOut = t.stdout.split('\n')
        .map(l => '\t' + l.trim())
        .join('\n')
    out += `  Stdout:\n${expectedStdOut}\n`;

    return out;
}

function writeTestResults(body: any) {
    const testResults = parseTestResults(body);
    const timestamp = new Date().toLocaleString();
    const header = `${timestamp}\n${body.pretty_lang ?? ''} | ${body.status_runtime ?? ''} | ${body.status_memory ?? ''} | ${body.total_correct ?? 0}/${body.total_testcases ?? 0} passed\n`;
    const output = header + SEPARATOR + '\n' + testResults.map(formatTestResult).join(SEPARATOR + '\n');

    fs.writeFile(TESTS_OUTPUT_PATH, output, { encoding: 'utf-8' }, (err) => {
        if (err) console.error('[Tests] Failed to write:', err);
    });

    console.log('[Tests]', `${body.total_correct}/${body.total_testcases} passed → _live_code/tests_output.txt`);
}

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
        .then(body => { if (body?.status_runtime) writeTestResults(body); })
        .catch(console.error);

    return response;
};
