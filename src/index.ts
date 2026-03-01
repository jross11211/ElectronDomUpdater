import { app, BrowserWindow } from 'electron';
import fs from "fs";
import { google_search_listener } from './execute_js_functions.js';
import {func_as_string} from "./utils.ts";
import {LIVE_CODESPACE_SOLUTION_PATH, URL_TARGET, windowConfig} from "./config.ts";
import {handleFileChange} from "./handle_file_change.ts";

app.on('ready', () => {

  const mainWindow = new BrowserWindow(windowConfig);

  mainWindow.loadURL(URL_TARGET)
      .then(() => {

        mainWindow.show();

        fs.watch(LIVE_CODESPACE_SOLUTION_PATH, handleFileChange(mainWindow));

        mainWindow?.webContents.executeJavaScript(
            func_as_string(google_search_listener, {})
        )
        .catch(console.error);

        mainWindow.webContents.openDevTools();
      });
});
