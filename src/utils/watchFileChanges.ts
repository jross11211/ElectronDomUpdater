import {BrowserWindow, ipcMain} from "electron";
import fs from "fs";
import {LIVE_CODESPACE_SOLUTION_PATH, LIVE_CODESPACE_TESTS_OUTPUT_PATH, LIVE_CODESPACE_ARCHIVE_PATH, LIVE_CODESPACE_RUN_PATH} from "../config.ts";
import parseTestResults, {TestResult} from "./parseTestResults.ts";

const isReadyForTesting = () => {
    if (fs.existsSync(LIVE_CODESPACE_RUN_PATH)) {
        fs.unlinkSync(LIVE_CODESPACE_RUN_PATH);
        return true;
    }
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
    const handleFileChange = () => {
        const content: string = fs.readFileSync(LIVE_CODESPACE_SOLUTION_PATH, 'utf8');
        if (content !== lastContent) {
            let run_tests = isReadyForTesting();
            mainWindow.webContents.send('updated-solution', content, run_tests);
            lastContent = content;
            fs.writeFileSync(archiveFile, content);
        }
    }

    fs.watch(LIVE_CODESPACE_SOLUTION_PATH, handleFileChange);

    ipcMain.on("tests-updated", (_, tests_output) => {
        writeTestResults(tests_output);
    });
}
