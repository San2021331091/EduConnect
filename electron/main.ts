import { app, BrowserWindow, nativeTheme, ipcMain } from 'electron';
import path from 'path';

const isDev = !app.isPackaged;

const createWindow = () => {
  const win = new BrowserWindow({

    width: 1200,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    frame: true,
    show: false, // show only when ready
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#1e1e1e' : '#ffffff',

    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'), // secure API bridge
    },
  });

  // Remove menu completely
  win.removeMenu();

  // Load URL or file depending on environment
  if (isDev) {
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Maximize and show when ready
  win.once('ready-to-show', () => {
    win.maximize(); // start maximized
    win.show();
  });

  // Optional: listen for renderer requests to close the app
  ipcMain.on('app-close', () => {
    win.close();
  });

  // Optional: listen for minimize or fullscreen toggle from renderer
  ipcMain.on('app-minimize', () => win.minimize());
  ipcMain.on('app-toggle-fullscreen', () => win.setFullScreen(!win.isFullScreen()));
};

// Create the window when Electron is ready
app.whenReady().then(createWindow);

// Quit when all windows are closed (except macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Recreate a window on macOS when clicking dock icon
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
