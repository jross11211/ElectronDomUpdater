import {app, BrowserWindow, ipcMain} from 'electron';
import path from 'node:path';
import {IPC_EVENTS, URL_TARGET} from "./config/constants.ts";
import {watchFileChanges} from "./utils/watchFileChanges.ts";
import {writeSolutionsFile} from "./io/localFileSystemIO.ts";
import logger from "./utils/logger.ts";

app.on('ready', () => {
    logger.trace('startup', 'App ready, creating main window');

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

    ipcMain.once(IPC_EVENTS.APP_FULLY_LOADED, (_, initialSolutionPy, slug) => {
        logger.trace('app-loaded', `IPC_APP_FULLY_LOADED received (slug: ${slug})`);
        watchFileChanges(mainWindow, slug);
        writeSolutionsFile(initialSolutionPy);
        mainWindow.webContents.openDevTools();
        logger.trace('app-loaded', 'Flow complete');
    });

    logger.trace('startup', `Loading URL: ${URL_TARGET}`);
    mainWindow.loadURL(URL_TARGET)
        .then(() => {
            logger.trace('startup', 'URL loaded, showing window');
            mainWindow.show();
        })
        .then(() => logger.trace('startup', 'Startup flow complete'))
        .catch(console.error);
});
