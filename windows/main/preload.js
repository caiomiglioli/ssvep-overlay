const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("overlay", {
  new: () => ipcRenderer.invoke('overlay:new'),
  open: () => ipcRenderer.invoke('overlay:open'),
  // open: (type) => ipcRenderer.invoke('overlay:open', type)
});