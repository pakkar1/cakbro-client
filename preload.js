const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('cakbro', {
  refresh: () => ipcRenderer.send('cakbro:refresh'),
  exit: () => ipcRenderer.send('cakbro:exit'),
  getConfig: () => ipcRenderer.invoke('cakbro:get-config'),
  onConfig: (callback) => ipcRenderer.on('cakbro:config', (_e, cfg) => callback(cfg))
});
