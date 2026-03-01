import {BrowserWindow} from "electron";
import fs from "fs";
import {log_to_window} from "./execute_js_functions.js";
import {func_as_string} from "./utils.ts";
import {LIVE_CODESPACE_SOLUTION_PATH} from "./config.ts";

let lastContent = '';

export const handleFileChange = (
    mainWindow: BrowserWindow
) => {
    return () => {
        const content: string = fs.readFileSync(LIVE_CODESPACE_SOLUTION_PATH, 'utf8');
        if (content !== lastContent) {
            console.log('Code updated:', content);
            lastContent = content;

            mainWindow.webContents.executeJavaScript(
                func_as_string(log_to_window, { 'message' : content })
            )
            .catch(console.error)
        }
    };
};
