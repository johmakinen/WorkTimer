const { app, BrowserWindow, ipcMain } = require('electron');
const { saveLog } = require('./log');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 300,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.on('save-log', (event, logEntries) => {
  saveLog(logEntries);
});

app.on('window-all-closed', () => {
  app.quit();
});