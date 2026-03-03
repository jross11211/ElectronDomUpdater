import {app, BrowserWindow, ipcMain} from 'electron';
import {URL_TARGET} from "./shared/config.ts";
import {watchFileChanges} from "./watchers/watchFileChanges.ts";
import {waitForMonacoLoad, watchDomUpdates} from "./watchers/watchDomUpdates.ts";

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
        watchDomUpdates(mainWindow)
            .then(() => {
                watchFileChanges(mainWindow);
                mainWindow.webContents.openDevTools();
            });
    });

    mainWindow.loadURL(URL_TARGET)
      .then(() => mainWindow.show())
      .then(() => waitForMonacoLoad(mainWindow));
});
