import {genInjectableSrc} from "../shared/utils.ts";
import domListener from "../injectables/domListener.js";
import {BrowserWindow} from "electron"
import waitForMonaco from "../injectables/waitForMonaco.js";

export const waitForMonacoLoad = (mainWindow: BrowserWindow) => {
    mainWindow.webContents.executeJavaScript(
        genInjectableSrc(waitForMonaco)
    )
    .catch(console.error);
}

export const watchDomUpdates = (mainWindow: BrowserWindow) => {
    return mainWindow.webContents.executeJavaScript(
        genInjectableSrc(domListener)
    );
}
