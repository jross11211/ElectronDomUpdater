import { ipcMain } from 'electron';
import fs from 'fs';
import { app } from 'electron';
import path from "node:path";
import parseTestResults, { TestResult } from "./parseTestResults.ts";

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

export default (mainWindow: any) => {
    const logDir = path.join(app.getAppPath(), 'network-logs');
    const testsOutputPath = path.join(app.getAppPath(), '_live_code', 'tests_output.txt');
    fs.mkdirSync(logDir, { recursive: true });
    fs.mkdirSync(path.dirname(testsOutputPath), { recursive: true });
    console.log('* network log dir = ', logDir);

    let counter = 0;

    ipcMain.on('captured-response', (_event, data) => {
        const ts = new Date().toISOString().replace(/[:.]/g, '-');
        const method = (data.request?.method ?? 'UNKNOWN').toUpperCase();
        const urlSlug = (data.request?.url ?? 'unknown')
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

        // Write combined test output to _live_code/tests_output.txt
        const body = data.response?.body;
        const header = `${body?.pretty_lang ?? ''} | ${body?.status_runtime ?? ''} | ${body?.status_memory ?? ''} | ${body?.total_correct ?? 0}/${body?.total_testcases ?? 0} passed\n`;
        const testsOutput = header + SEPARATOR + '\n' +
            testResults.map(formatTestResult).join(SEPARATOR + '\n');

        fs.writeFile(testsOutputPath, testsOutput, { encoding: 'utf-8' }, (err) => {
            if (err) console.error('[Network] Failed to write tests output:', err);
        });

        console.log('[Network]', method, data.request?.url, '->', data.response?.status, `→ ${rawFilename}`);
        console.log('[Parsed]', `${testResults.length} test results → ${parsedFilename}`);
    });
}
