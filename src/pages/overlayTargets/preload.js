const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('ipc', {
  getTargetsFile: () => ipcRenderer.invoke('getTargetsFile'),
  send: (channel, message) => ipcRenderer.send(channel, message),
  on: (channel, callback) => ipcRenderer.on(channel, callback)
});