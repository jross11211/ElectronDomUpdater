import {app, BrowserWindow, ipcMain} from 'electron';
import path from 'node:path';
import {LIVE_CODESPACE_SOLUTION_PATH, URL_TARGET} from "./config/constants.ts";
import {IPC_APP_FULLY_LOADED, IPC_UPDATED_SOLUTION, IPC_RUN_CODE} from "./config/ipcChannels.ts";
import {watchFileChanges} from "./utils/watchFileChanges.ts";
import waitForEditorLoad from "./injectables/waitForEditorLoad.js";
import fs from "fs";

app.on('ready', () => {

    const mainWindow = new BrowserWindow({
      show: false,
      width: 1024,
      height: 728,
      webPreferences: {
          preload: path.join(__dirname, 'preload.js'),
          nodeIntegration: true,
          contextIsolation: false,
          webSecurity: false,
          partition: 'persist:electron-dom-updater'
      }
    });

    ipcMain.once(IPC_APP_FULLY_LOADED, (_, initialSolutionPy, slug) => {
        console.log(IPC_APP_FULLY_LOADED, initialSolutionPy, slug)
        watchFileChanges(mainWindow, slug);
        fs.writeFileSync(LIVE_CODESPACE_SOLUTION_PATH, initialSolutionPy);
        mainWindow.webContents.openDevTools();
    });

    mainWindow.loadURL(URL_TARGET)
        .then(() => mainWindow.show())
        .then(() => mainWindow.webContents.executeJavaScript(
            `(${String(waitForEditorLoad)})('${IPC_APP_FULLY_LOADED}', '${IPC_UPDATED_SOLUTION}', '${IPC_RUN_CODE}')`
        ))
        .catch(console.error);
});
