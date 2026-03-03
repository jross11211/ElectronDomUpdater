import {app, BrowserWindow } from 'electron';
import {URL_TARGET, windowConfig} from "./shared/config.ts";
import {watchFileChanges} from "./watchers/watchFileChanges.ts";
import {watchDomUpdates} from "./watchers/watchDomUpdates.ts";

// Main electron process - Called after forge.config.ts is loaded
app.on('ready', () => {

  const mainWindow = new BrowserWindow(windowConfig);

  mainWindow.loadURL(URL_TARGET)
      .then(() => {

        mainWindow.show();
        mainWindow.webContents.openDevTools();

        watchFileChanges(mainWindow);
        watchDomUpdates(mainWindow);
    });
});
