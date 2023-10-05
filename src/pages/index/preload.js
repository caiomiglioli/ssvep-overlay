const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("overlay", {

  open: (type) => ipcRenderer.send('openOverlay', type)
});