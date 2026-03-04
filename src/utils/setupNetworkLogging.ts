import { ipcMain } from 'electron';
import fs from 'fs';
import { app } from 'electron';
import path from "node:path";

export default (mainWindow: any) => {
    const logDir = path.join(app.getAppPath(), 'network-logs');
    fs.mkdirSync(logDir, { recursive: true });
    console.log('* network log dir = ', logDir);

    let counter = 0;

    ipcMain.on('captured-response', (_event, data) => {
        const ts = new Date().toISOString().replace(/[:.]/g, '-');
        const method = (data.request?.method ?? 'UNKNOWN').toUpperCase();
        const urlSlug = (data.request?.url ?? 'unknown')
            .replace(/^https?:\/\//, '')
            .replace(/[^a-zA-Z0-9_\-]/g, '_')
            .slice(0, 80);
        const filename = `${ts}_${String(counter++).padStart(4, '0')}_${method}_${urlSlug}.json`;
        const filePath = path.join(logDir, filename);

        fs.writeFile(filePath, JSON.stringify(data, null, 2), { encoding: 'utf-8' }, (err) => {
            if (err) console.error('[Network] Failed to write log:', err);
        });

        console.log('[Network]', method, data.request?.url, '->', data.response?.status, `→ ${filename}`);
    });
}
