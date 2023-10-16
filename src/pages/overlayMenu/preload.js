const { contextBridge, ipcRenderer, dialog } = require("electron")

contextBridge.exposeInMainWorld("ipc", {
  send: (channel, message) => ipcRenderer.send(channel, message),
  on: (channel, callback) => ipcRenderer.on(channel, callback),
  saveDialog: (cfg) => ipcRenderer.invoke('showSaveDialogSync', cfg),
  exitOverlay: () => ipcRenderer.invoke('exitOverlay'),
});