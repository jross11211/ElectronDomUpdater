import {app, BrowserWindow, ipcMain} from 'electron';
import path from 'node:path';
import {LIVE_CODESPACE_SOLUTION_PATH, URL_TARGET} from "./config.ts";
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

    ipcMain.once('app-fully-loaded', (_, initialSolutionPy, slug) => {
        console.log('app-fully-loaded', initialSolutionPy, slug)
        watchFileChanges(mainWindow, slug);
        fs.writeFileSync(LIVE_CODESPACE_SOLUTION_PATH, initialSolutionPy);
        mainWindow.webContents.openDevTools();
    });

    mainWindow.loadURL(URL_TARGET)
        .then(() => mainWindow.show())
        .then(() => mainWindow.webContents.executeJavaScript(
            `(${String(waitForEditorLoad)})()`
        ))
        .catch(console.error);
});
