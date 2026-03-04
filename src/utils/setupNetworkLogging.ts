import { app, session, BrowserWindow } from 'electron';
import fs from 'fs';
import path from 'path';

const startTime = new Date();
const timestamp = startTime.toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .slice(0, -5);

const logBaseDir = path.join(app.getAppPath(), 'network-logs');
const logDir = path.join(logBaseDir, `network-logs-responses-only_${timestamp}`);

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
    console.log(`Response logs saved to: ${logDir}`);
}

export default function setupResponseLogging(win: BrowserWindow) {
    const ses = win.webContents.session;

    // Helper: filename based only on response time + sanitized URL
    const getLogFilePath = (details: any) => {
        const respTime = new Date();
        const ts = respTime.toISOString()
            .replace(/[:.]/g, '-')
            .replace('T', '_')
            .slice(0, -1);

        const urlPart = details.url
            .replace(/^https?:\/\//, '')
            .replace(/[/:?=&]/g, '_')
            .slice(0, 80)
            .replace(/_+$/, '');

        return path.join(
            logDir,
            `${ts}__${details.method || 'UNKNOWN'}__${urlPart || 'unknown'}.txt`
        );
    };

    // ── RESPONSE STARTED (early info: status + initial headers) ──
    ses.webRequest.onResponseStarted((details) => {
        if (!details.statusCode) return; // skip if no real response yet

        const filePath = getLogFilePath(details);

        let content = `=== RESPONSE ===\n`;
        content += `Time: ${new Date().toISOString()}\n`;
        content += `URL: ${details.url}\n`;
        content += `Method: ${details.method}\n`;
        content += `Status: ${details.statusCode}\n`;
        content += `From cache: ${details.fromCache}\n`;
        if (details.responseHeaders) {
            content += `Response Headers:\n${JSON.stringify(details.responseHeaders, null, 2)}\n`;
        }
        content += `Timing (partial): ${JSON.stringify(details.timing ?? {}, null, 2)}\n\n`;

        fs.writeFile(filePath, content, (err) => {
            if (err) console.error('Failed to write response start:', err);
        });
    });

    // ── RESPONSE COMPLETED (final status + full timing) ──
    ses.webRequest.onCompleted((details) => {

        const filePath = getLogFilePath(details); // same file

        let append = `Final Status: ${details.statusCode}\n`;
        append += `Final Timing: ${JSON.stringify(details.timing ?? {}, null, 2)}\n`;

        fs.appendFile(filePath, append, (err) => {
            if (err) console.error('Failed to append completion:', err);
        });
    });

    // ── TRY TO CAPTURE RESPONSE BODY (most useful part for GraphQL etc.) ──
    win.webContents.on('dom-ready', () => {
        try {
            win.webContents.debugger.attach('1.3');
            win.webContents.debugger.sendCommand('Network.enable');

            win.webContents.debugger.on('message', (event, method, params) => {
                if (method === 'Network.responseReceived') {
                    const requestId = params.requestId;
                    const url = params.response.url;

                    win.webContents.debugger.sendCommand('Network.getResponseBody', { requestId }, (err, result) => {
                        if (err || !result?.body) return;

                        const bodyPath = path.join(
                            logDir,
                            `body_${requestId}__${url.split('/').pop() || 'response'}.txt`
                        );

                        const bodyContent = result.base64Encoded
                            ? Buffer.from(result.body, 'base64').toString('utf-8')
                            : result.body;

                        fs.writeFile(bodyPath, bodyContent, (err) => {
                            if (err) console.error('Body write failed:', err);
                        });
                    });
                }
            });
        } catch (e) {
            console.warn('Debugger could not attach (common in some packaged builds):', e);
        }
    });
}