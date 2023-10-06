const { BrowserWindow } = require('electron')
const path = require('path')

function openOverlayMenu() {
  const window = new BrowserWindow({
    width: 300,
    height: 100,
    // frame: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  window.name = 'overlay-menu'
  window.loadFile(path.join(__dirname, 'index.html'))
  window.webContents.openDevTools();
  return window;
}

module.exports = {openOverlayMenu}