const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createOverlayWindow() {
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  window.name = 'overlay'
  window.loadFile(path.join(__dirname, 'index.html'))
  window.webContents.openDevTools();
  return window
}

function createOverlayMenuWindow(overlayWindow) {
  console.log('createOverlayMenuWindow')
  // return window
}

async function openOverlay(mode) {
  // ------- READ TARGETS FILE
  let config = {'targets': []}
  
  if (mode == 'read'){ // read target file
    const file = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{name: 'JSON', extensions: ['json']}]
    });
    config = JSON.parse(fs.readFileSync(file.filePaths[0]));
  }
  
  ipcMain.handleOnce('getTargetsFile', () => config) // send info

  // ------- OPEN OVERLAY
  overlayWindow = createOverlayWindow()
  createOverlayMenuWindow()

  // ------- HIDE MAIN WINDOW
  mainWindow = BrowserWindow.getAllWindows()
    .find(win => {return win.name === 'index';})

  mainWindow.hide() // esconder tela inicial quando overlay for aberto
  overlayWindow.on('close', () => mainWindow.show()) // mostrar tela inicial quando overlay for fechado
}

module.exports = { openOverlay }