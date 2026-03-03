import {app, BrowserWindow, ipcMain} from 'electron';
import {URL_TARGET} from "./config.ts";
import {watchFileChanges} from "./utils/watchFileChanges.ts";
import waitForEditorLoad from "./injectables/waitForEditorLoad.js";

app.on('ready', () => {

    const mainWindow = new BrowserWindow({
      show: false,
      width: 1024,
      height: 728,
      webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
          webSecurity: false,
          partition: 'persist:electron-dom-updater'
      }
    });

    ipcMain.once('app-full-loaded', () => {
        watchFileChanges(mainWindow);
        mainWindow.webContents.openDevTools();
    });

    mainWindow.loadURL(URL_TARGET)
      .then(() => mainWindow.show())
      .then(() => mainWindow.webContents.executeJavaScript(
          String(waitForEditorLoad)
      ));
});
