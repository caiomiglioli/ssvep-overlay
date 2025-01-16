const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("targets", {
  save: (targets, modules) => ipcRenderer.invoke("config:save", targets, modules),
  get: () => ipcRenderer.invoke("targets:get"),
  getModules: () => ipcRenderer.invoke("modules:get"),
  getAvailableModules: () => ipcRenderer.invoke("modules:getAvailable"),
  //
  onEditmode: (callback) => ipcRenderer.on("targets:editmode", callback),
  offEditmode: (callback) => ipcRenderer.removeListener("targets:editmode", callback),
});
