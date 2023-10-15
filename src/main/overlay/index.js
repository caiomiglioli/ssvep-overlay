const { BrowserWindow, dialog, ipcMain } = require('electron');
const fs = require('fs');
const {openOverlayMenu} = require('../../pages/overlayMenu')
const {openOverlayTargets} = require('../../pages/overlayTargets')

async function openOverlay(mode) {
  // ------- READ TARGETS FILE
  let config = {'targets': []};
  
  if (mode == 'read'){ // read target file
    const file = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{name: 'JSON', extensions: ['json']}]
    });
    config = JSON.parse(fs.readFileSync(file.filePaths[0]));
  }
  
  ipcMain.handle('getTargetsFile', () => config); // send info

  // ------- OPEN OVERLAY
  menuWindow = openOverlayMenu();
  overlayWindow = openOverlayTargets(menuWindow);

  // ------- HIDE MAIN WINDOW
  mainWindow = BrowserWindow.getAllWindows()
    .find(win => {return win.name === 'index';});
  mainWindow.hide(); // esconder tela inicial quando overlay for aberto

  // ------- COMUNICATION
  const to = (event, toggle) => { //toggle = true ou false
    overlayWindow.setAlwaysOnTop(!toggle, "normal");
    overlayWindow.setIgnoreMouseEvents(!toggle);
    overlayWindow.setFocusable(toggle);
  };
  ipcMain.on('toggle-overlay-editmode', to);

  const mtt = (event, msg) => overlayWindow.webContents.send('menu-to-targets', msg);
  ipcMain.on('menu-to-targets', mtt);

  const ttm = (event, msg) => menuWindow.webContents.send('targets-to-menu', msg);
  ipcMain.on('targets-to-menu', ttm);  
  
  // ------- CLOSE PROCESS
  menuWindow.on('close', () => { // mostrar tela inicial quando overlay for fechado
    ipcMain.removeHandler('getTargetsFile');
    ipcMain.removeListener('toggle-overlay-editmode', to);
    ipcMain.removeListener('menu-to-targets', mtt);
    ipcMain.removeListener('targets-to-menu', ttm);
    overlayWindow.close();
    mainWindow.show();
  })
}

module.exports = { openOverlay }