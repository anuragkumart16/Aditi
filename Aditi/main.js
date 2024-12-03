import { app, BrowserWindow } from 'electron';
import path from 'path';

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,  // Enable node integration
      contextIsolation: false, // Disable context isolation
    },
  });

  // Load React app served by Vite
  win.loadURL('http://localhost:5173');  // Update this to match the Vite dev server port

  win.on('closed', () => {
    win = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});