import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  closeApp: () => ipcRenderer.send('app-close'),
});
