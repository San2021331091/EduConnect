"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const isDev = !electron_1.app.isPackaged;
const createWindow = () => {
    const win = new electron_1.BrowserWindow({
        width: 1200,
        height: 700,
        minWidth: 800,
        minHeight: 600,
        frame: true,
        show: false, // show only when ready
        backgroundColor: electron_1.nativeTheme.shouldUseDarkColors ? '#1e1e1e' : '#ffffff',
        webPreferences: {
            contextIsolation: true,
            preload: path_1.default.join(__dirname, 'preload.js'), // secure API bridge
        },
    });
    // Remove menu completely
    win.removeMenu();
    // Load URL or file depending on environment
    if (isDev) {
        win.loadURL('http://localhost:3000');
        win.webContents.openDevTools();
    }
    else {
        win.loadFile(path_1.default.join(__dirname, '../renderer/index.html'));
    }
    // Maximize and show when ready
    win.once('ready-to-show', () => {
        win.maximize(); // start maximized
        win.show();
    });
    // Optional: listen for renderer requests to close the app
    electron_1.ipcMain.on('app-close', () => {
        win.close();
    });
    // Optional: listen for minimize or fullscreen toggle from renderer
    electron_1.ipcMain.on('app-minimize', () => win.minimize());
    electron_1.ipcMain.on('app-toggle-fullscreen', () => win.setFullScreen(!win.isFullScreen()));
};
// Create the window when Electron is ready
electron_1.app.whenReady().then(createWindow);
// Quit when all windows are closed (except macOS)
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
// Recreate a window on macOS when clicking dock icon
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0)
        createWindow();
});
