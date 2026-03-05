import {BrowserWindow, ipcMain} from "electron";
import fs from "fs";
import {LIVE_CODESPACE_SOLUTION_PATH, LIVE_CODESPACE_TESTS_OUTPUT_PATH, LIVE_CODESPACE_ARCHIVE_PATH} from "../config.ts";

let lastContent = '';

export const watchFileChanges = (mainWindow: BrowserWindow, slug: string) => {

    fs.mkdirSync(LIVE_CODESPACE_ARCHIVE_PATH, { recursive: true });
    const archiveFile = LIVE_CODESPACE_ARCHIVE_PATH + '/' + slug + '_solution.py';

    const handleFileChange = () => {
        const content: string = fs.readFileSync(LIVE_CODESPACE_SOLUTION_PATH, 'utf8');
        if (content !== lastContent) {
            mainWindow.webContents.send('updated-solution', content);
            lastContent = content;
            fs.writeFileSync(archiveFile, content);
        }
    }

    fs.watch(LIVE_CODESPACE_SOLUTION_PATH, handleFileChange);

    handleFileChange();

    ipcMain.on("tests-updated", (_, tests_output) => {
        console.log(tests_output);

        fs.writeFileSync(LIVE_CODESPACE_TESTS_OUTPUT_PATH, tests_output);
    })
}
