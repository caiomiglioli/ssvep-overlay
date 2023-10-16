const { BrowserWindow, screen } = require('electron');
const path = require('path');



function openOverlayTargets(overlayMenu) {
  primaryDisplay = screen.getPrimaryDisplay()

  const window = new BrowserWindow({
    parent: overlayMenu,
    // frame: false,
    // focusable: false,
    // transparent: true,
    // alwaysOnTop: true,
    closable: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  // window.setBounds(primaryDisplay.workArea)
  // window.setIgnoreMouseEvents(true);
  window.name = 'overlay-targets';

  window.loadFile(path.join(__dirname, 'index.html'))
  window.webContents.openDevTools();
  return window
}

module.exports = { openOverlayTargets }