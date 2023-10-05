const { app, BrowserWindow } = require('electron')
const path = require('path')

function openIndex () {
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    // frame: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  window.name = 'index'
  window.loadFile(path.join(__dirname, 'index.html'))
  window.webContents.openDevTools();
}

module.exports = {openIndex}