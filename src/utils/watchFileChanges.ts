import {BrowserWindow, ipcMain} from "electron";
import fs from "fs";
import {LIVE_CODESPACE_SOLUTION_PATH, LIVE_CODESPACE_TESTS_OUTPUT_PATH, LIVE_CODESPACE_ARCHIVE_PATH, LIVE_CODESPACE_RUN_PATH} from "../config.ts";

const isReadyForTesting = () => {
    if (fs.existsSync(LIVE_CODESPACE_RUN_PATH)) {
        fs.unlinkSync(LIVE_CODESPACE_RUN_PATH);
        return true;
    }
    return false;
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
        console.log(tests_output);

        fs.writeFileSync(LIVE_CODESPACE_TESTS_OUTPUT_PATH, tests_output);
    })
}
