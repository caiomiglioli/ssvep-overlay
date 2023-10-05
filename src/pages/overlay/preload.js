const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('g', {
  getTargetsFile: () => ipcRenderer.invoke('getTargetsFile')
})