const { app, BrowserWindow, ipcMain } = require('electron');
const WebSocket = require('ws');

let googleWindow = null;
let reactWindow = null;
// WebSocket server — watcher connects here and sends code updates
const wss = new WebSocket.Server({ port: 8090 });
wss.on('connection', (ws) => {
  console.log('[WS] Watcher connected');
  ws.on('message', (data) => {
    const message = JSON.parse(data);
    if (message.type === 'code-update' && reactWindow) {
      reactWindow.webContents.send('code-update', message.code);
    }
  });
});

ipcMain.on('google-search-change', (_event, value) => {
  console.log('[Google Search]', value);
});

const createGoogleWindow = () => {
  googleWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
  });

  googleWindow.loadURL('https://google.com');

  googleWindow.webContents.on('did-finish-load', () => {
    googleWindow.webContents.executeJavaScript(`
      (function () {
        const { ipcRenderer } = require('electron');
        const searchBar = document.querySelector('input[name="q"], textarea[name="q"]');
        if (searchBar) {
          searchBar.addEventListener('input', (e) => {
            ipcRenderer.send('google-search-change', e.target.value);
            console.log('[Google Search]', e.target.value);
            e.target.value = '';
          });
        }
      })();
    `);
  });

  googleWindow.on('ready-to-show', () => googleWindow.show());
  googleWindow.on('closed', () => { googleWindow = null; });
};

const createReactWindow = () => {
  reactWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const loadDevURL = () => {
    reactWindow.loadURL('http://localhost:5173').catch(() => setTimeout(loadDevURL, 500));
  };
  loadDevURL();

  reactWindow.on('ready-to-show', () => reactWindow.show());
  reactWindow.on('closed', () => { reactWindow = null; });
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.whenReady().then(() => {

  // WebSocket server — just logs the code
  const wss = new WebSocket.Server({ port: 8080 });

  wss.on('connection', ws => {
    console.log('JetBrains connected!');
    ws.on('message', data => {
      const msg = JSON.parse(data);
      if (msg.type === 'code-update') {
        console.log('Received code from JetBrains:');
        console.log('---');
        console.log(msg.code);
        console.log('---');
      }
    });
  });

  createGoogleWindow();
  createReactWindow();
  app.on('activate', () => {
    if (googleWindow === null) createGoogleWindow();
    if (reactWindow === null) createReactWindow();
  });
}).catch(console.log);
