import {BrowserWindow} from "electron";
import fs from "fs";
import {LIVE_CODESPACE_SOLUTION_PATH} from "../config.ts";

let lastContent = '';

export const watchFileChanges = (mainWindow: BrowserWindow) => {

    const handleFileChange = () => {
        const content: string = fs.readFileSync(LIVE_CODESPACE_SOLUTION_PATH, 'utf8');
        if (content !== lastContent) {
            mainWindow.webContents.send('updated-solution', content);
            lastContent = content;
        }
    }

    fs.watch(LIVE_CODESPACE_SOLUTION_PATH, handleFileChange);

    handleFileChange();
}
