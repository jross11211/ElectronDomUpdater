import {BrowserWindow} from "electron";
import fs from "fs";
import logToWindow from "../injectables/logToWindow.js";
import {genInjectableSrc} from "../shared/utils.ts";
import {LIVE_CODESPACE_SOLUTION_PATH} from "../shared/config.ts";

let lastContent = '';

export const watchFileChanges = (mainWindow: BrowserWindow) => {
    fs.watch(LIVE_CODESPACE_SOLUTION_PATH, () => {

            const content: string = fs.readFileSync(LIVE_CODESPACE_SOLUTION_PATH, 'utf8');
            if (content !== lastContent) {
                console.log('Code updated:', content);
                lastContent = content;

                mainWindow.webContents.executeJavaScript(
                    genInjectableSrc(logToWindow, { 'message' : content })
                )
                .catch(console.error)
            }
        }
    );
}