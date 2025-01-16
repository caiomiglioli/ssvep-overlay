const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("targetsPage", {
  saveConfig: (targets, modules) => ipcRenderer.invoke("config:save", targets, modules),
  updateConfig: (targets, modules) => ipcRenderer.invoke("config:update", targets, modules),
  getTargets: () => ipcRenderer.invoke("targets:get"),
  getModules: () => ipcRenderer.invoke("modules:get"),
  getAvailableModules: () => ipcRenderer.invoke("modules:getAvailable"),
  //
  onEditmode: (callback) => ipcRenderer.on("targets:editmode", callback),
  offEditmode: (callback) => ipcRenderer.removeListener("targets:editmode", callback),
  //
  onError: (callback) => ipcRenderer.on("targets:error", callback),
  offError: (callback) => ipcRenderer.removeListener("targets:error", callback),
});
