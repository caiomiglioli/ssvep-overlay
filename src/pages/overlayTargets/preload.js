const { contextBridge, ipcRenderer } = require('electron');
const { v4 } = require("uuid");
const { writeFileSync } = require("fs");

contextBridge.exposeInMainWorld('ipc', {
  getTargetsFile: () => ipcRenderer.invoke('getTargetsFile'),
  send: (channel, message) => ipcRenderer.send(channel, message),
  on: (channel, callback) => ipcRenderer.on(channel, callback),
  uuid: () => v4(),
  savePreset: (path, json) => writeFileSync(path, JSON.stringify(json))
});