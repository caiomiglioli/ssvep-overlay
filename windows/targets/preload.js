const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("targets", {
  get: () => ipcRenderer.invoke('targets:get'),
  save: (targets) => ipcRenderer.invoke('targets:save', targets),
  onEditmode: (callback) => ipcRenderer.on('targets:editmode', callback),
  offEditmode: (callback) => ipcRenderer.removeListener('targets:editmode', callback),
});