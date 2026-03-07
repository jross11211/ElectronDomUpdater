import {app, BrowserWindow, ipcMain} from 'electron';
import path from 'node:path';
import {URL_TARGET} from "./config/constants.ts";
import {watchFileChanges} from "./utils/watchFileChanges.ts";
import waitForEditorLoad from "./injectables/waitForEditorLoad.js";
import ipcChannels, {getIpcChannelsWrapper} from "./injectables/ipcChannels.js";
import {writeSolutionsFile} from "./io/localFileSystemIO.ts";

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

    ipcMain.once(ipcChannels.IPC_APP_FULLY_LOADED, (_, initialSolutionPy, slug) => {
        console.log(ipcChannels.IPC_APP_FULLY_LOADED, initialSolutionPy, slug)
        watchFileChanges(mainWindow, slug);
        writeSolutionsFile(initialSolutionPy);
        mainWindow.webContents.openDevTools();
    });

    mainWindow.loadURL(URL_TARGET)
        .then(() => mainWindow.show())
        .then(() => mainWindow.webContents.executeJavaScript(
            `(${String(getIpcChannelsWrapper)})()`
        ))
        .then(() => mainWindow.webContents.executeJavaScript(
            `(${String(waitForEditorLoad)})()`
        ))
        .catch(console.error);
});
