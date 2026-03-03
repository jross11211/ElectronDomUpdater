import {app, BrowserWindow } from 'electron';
import {URL_TARGET} from "./shared/config.ts";
import {watchFileChanges} from "./watchers/watchFileChanges.ts";
import {watchDomUpdates} from "./watchers/watchDomUpdates.ts";

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

  mainWindow.loadURL(URL_TARGET)
      .then(() => {

        mainWindow.show();
        mainWindow.webContents.openDevTools();

        watchFileChanges(mainWindow);
        watchDomUpdates(mainWindow);
    });
});
