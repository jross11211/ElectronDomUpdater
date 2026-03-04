import { ipcMain } from 'electron';
import fs from 'fs';
import { app } from 'electron';
import path from "node:path";

export default (mainWindow: any) => {
    const logPath = path.join(app.getPath('userData'), 'network-log.ndjson');
    console.log('* log path = ', logPath);

    const logStream = fs.createWriteStream(logPath, { flags: 'a' });

    ipcMain.on('captured-response', (_event, data) => {
        logStream.write(JSON.stringify(data) + '\n');
        console.log('[Network]', data.request?.method, data.request?.url, '->', data.response?.status);
    });
}
