import {genInjectableSrc} from "../shared/utils.ts";
import domListener from "../injectables/domListener.js";
import {BrowserWindow, ipcMain} from "electron"

export const watchDomUpdates = (mainWindow: BrowserWindow) => {
    mainWindow.webContents.executeJavaScript(
        genInjectableSrc(domListener)
    )
        .catch(console.error);

    ipcMain.on('google-search-change', ({}, data: any) => {
        mainWindow.webContents.send('google-search-change-ack');
        console.log(`Google Search Change: ${data}`);
    })
}
