import { ipcMain } from 'electron';
import fs from 'fs';
import { app } from 'electron';
import path from "node:path";
import parseTestResults from "./parseTestResults.ts";

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
        const idx = String(counter++).padStart(4, '0');
        const rawFilename = `${ts}_${idx}_${method}_${urlSlug}.json`;
        const parsedFilename = `${ts}_${idx}_${method}_${urlSlug}_parsed.json`;

        fs.writeFile(path.join(logDir, rawFilename), JSON.stringify(data, null, 2), { encoding: 'utf-8' }, (err) => {
            if (err) console.error('[Network] Failed to write log:', err);
        });

        const testResults = parseTestResults(data);
        fs.writeFile(path.join(logDir, parsedFilename), JSON.stringify(testResults, null, 2), { encoding: 'utf-8' }, (err) => {
            if (err) console.error('[Network] Failed to write parsed log:', err);
        });

        console.log('[Network]', method, data.request?.url, '->', data.response?.status, `→ ${rawFilename}`);
        console.log('[Parsed]', `${testResults.length} test results → ${parsedFilename}`);
    });
}
