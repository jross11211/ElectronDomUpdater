import {BrowserWindow, ipcMain} from "electron";
import {LRUCache} from "lru-cache";
import {IPC_EVENTS, LIVE_CODESPACE_ARCHIVE_PATH} from "../config/constants.ts";
import parseTestResults, {TestResult} from "./parseTestResults.ts";
import {
    checkIfRunTxtExists, makeArchiveDir,
    watchSolutionsFile,
    writeArchiveFile,
    writeTestsFile
} from "../io/localFileSystemIO.ts";
import logger from "./logger.ts";

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
    logger.trace('leet-code-server-test-result', 'Parsing test results');
    const testResults = parseTestResults(body);
    const timestamp = new Date().toLocaleString();
    const header = `${timestamp}\n${body.pretty_lang ?? ''} | ${body.status_runtime ?? ''} | ${body.status_memory ?? ''} | ${body.total_correct ?? 0}/${body.total_testcases ?? 0} passed\n`;
    const SEPARATOR = '--------------------------------------------------------------';
    const output = header + SEPARATOR + '\n' + testResults.map(formatTestResult).join(SEPARATOR + '\n');

    writeTestsFile(output);
}

export const watchFileChanges = (mainWindow: BrowserWindow, slug: string) => {
    logger.trace('live-solution-updated', 'Setting up file watchers');
    makeArchiveDir();

    let lastContent = '';
    let waitingForResults = false;
    let pendingCode: string | null = null;
    const resultsCache = new LRUCache<string, any>({ max: 10 });

    watchSolutionsFile(content => {
        if (waitingForResults) {
            return;
        }
        if (content === lastContent) {
            return;
        }

        logger.trace('live-solution-updated', 'watchSolutionsFile.ts - solutions.py changed');

        const run_tests = checkIfRunTxtExists();

        if (run_tests && resultsCache.has(content)) {
            logger.trace('live-solution-updated', 'watchSolutionsFile.ts - cache hit, skipping test evaluation');
            mainWindow.webContents.send(IPC_EVENTS.EDITED_SOLUTION, content, false);
            writeTestResults(resultsCache.get(content));
        } else if (run_tests) {
            waitingForResults = true;
            pendingCode = content;
            mainWindow.webContents.send(IPC_EVENTS.EDITED_SOLUTION, content, true);
        } else {
            mainWindow.webContents.send(IPC_EVENTS.EDITED_SOLUTION, content, false);
        }

        lastContent = content;
        const archiveFile = LIVE_CODESPACE_ARCHIVE_PATH + '/' + slug + '_solution.py';
        writeArchiveFile(archiveFile, content);
        logger.trace('live-solution-updated', 'Flow complete');
    });

    ipcMain.on(IPC_EVENTS.TEST_RESULTS_ARRIVED, (_, tests_output) => {
        logger.trace('leet-code-server-test-result', 'IPC_TESTS_UPDATED received');

        if (pendingCode) {
            logger.trace('leet-code-server-test-result', 'Caching results for pending code');
            resultsCache.set(pendingCode, tests_output);
            pendingCode = null;
        }

        waitingForResults = false;
        writeTestResults(tests_output);
    });
}
