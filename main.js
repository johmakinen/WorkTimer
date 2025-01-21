const { app, BrowserWindow, ipcMain } = require('electron');
const { saveLog } = require('./log');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 500,
    height: 200,
    alwaysOnTop: true, // Make the window always stay on top
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  win.loadFile('index.html');
}

function adjustWindowSize(projectCount) {
  const baseHeight = 200;
  const projectHeight = 50;
  const newHeight = baseHeight + projectCount * projectHeight;
  win.setSize(500, newHeight);
}

app.whenReady().then(createWindow);

ipcMain.on('save-log', (event, logEntries) => {
  saveLog(logEntries);
});

ipcMain.on('adjust-window-size', (event, projectCount) => {
  adjustWindowSize(projectCount);
});

app.on('window-all-closed', () => {
  app.quit();
});