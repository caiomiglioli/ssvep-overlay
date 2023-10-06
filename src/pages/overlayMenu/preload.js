const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("ipc", {
  send: (channel, message) => ipcRenderer.send(channel, message),
  on: (channel, callback) => ipcRenderer.on(channel, callback)
});