import {BrowserWindow, ipcMain} from "electron";
import fs from "fs";
import {LRUCache} from "lru-cache";
import {LIVE_CODESPACE_SOLUTION_PATH, LIVE_CODESPACE_TESTS_OUTPUT_PATH, LIVE_CODESPACE_ARCHIVE_PATH, LIVE_CODESPACE_RUN_PATH} from "../config/constants.ts";
import {IPC_UPDATED_SOLUTION, IPC_TESTS_UPDATED} from "../config/ipcChannels.ts";
import parseTestResults, {TestResult} from "./parseTestResults.ts";

const isReadyForTesting = () => {
    if (fs.existsSync(LIVE_CODESPACE_RUN_PATH)) {
        fs.unlinkSync(LIVE_CODESPACE_RUN_PATH);
        console.log('[updated-solution] run.txt found and deleted → shouldRun: true');
        return true;
    }
    console.log('[updated-solution] No run.txt → shouldRun: false');
    return false;
}

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
    const SEPARATOR = '--------------------------------------------------------------';
    const output = header + SEPARATOR + '\n' + testResults.map(formatTestResult).join(SEPARATOR + '\n');

    fs.writeFile(LIVE_CODESPACE_TESTS_OUTPUT_PATH, output, { encoding: 'utf-8' }, (err) => {
        if (err) console.error('[Tests] Failed to write:', err);
    });

    console.log('[Tests]', `${body.total_correct}/${body.total_testcases} passed → _live_code/tests_output.txt`);
}

export const watchFileChanges = (mainWindow: BrowserWindow, slug: string) => {

    fs.mkdirSync(LIVE_CODESPACE_ARCHIVE_PATH, { recursive: true });
    const archiveFile = LIVE_CODESPACE_ARCHIVE_PATH + '/' + slug + '_solution.py';

    let lastContent = '';
    let waitingForResults = false;
    let pendingCode: string | null = null;
    const resultsCache = new LRUCache<string, any>({ max: 10 });

    const handleFileChange = () => {
        if (waitingForResults) {
            console.log('[updated-solution] Waiting for test results, ignoring file change');
            return;
        }

        const content: string = fs.readFileSync(LIVE_CODESPACE_SOLUTION_PATH, 'utf8');
        if (content === lastContent) {
            console.log('[updated-solution] solution.py triggered but content unchanged, skipping');
            return;
        }

        console.log('[updated-solution] solution.py changed, processing...');
        let run_tests = isReadyForTesting();

        if (run_tests && resultsCache.has(content)) {
            console.log('[updated-solution] Cache hit, writing cached results');
            mainWindow.webContents.send(IPC_UPDATED_SOLUTION, content, false);
            writeTestResults(resultsCache.get(content));
        } else if (run_tests) {
            console.log('[updated-solution] Cache miss, running tests');
            waitingForResults = true;
            pendingCode = content;
            mainWindow.webContents.send(IPC_UPDATED_SOLUTION, content, true);
        } else {
            mainWindow.webContents.send(IPC_UPDATED_SOLUTION, content, false);
        }

        console.log('[updated-solution] Sent to renderer');
        lastContent = content;
        fs.writeFileSync(archiveFile, content);
        console.log('[updated-solution] Archived to', archiveFile);
    }

    fs.watch(LIVE_CODESPACE_SOLUTION_PATH, handleFileChange);

    ipcMain.on(IPC_TESTS_UPDATED, (_, tests_output) => {
        console.log('[tests-updated] Received in main');
        if (pendingCode) {
            console.log('[tests-updated] Caching results for pending code');
            resultsCache.set(pendingCode, tests_output);
            pendingCode = null;
        }
        waitingForResults = false;
        writeTestResults(tests_output);
    });
}
