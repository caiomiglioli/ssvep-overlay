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
  const mtt = (event, arg) => {console.log(arg), overlayWindow.webContents.send('menu-to-targets', arg)};
  ipcMain.on('menu-to-targets', mtt);

  const ttm = (event, arg) => menuWindow.webContents.send('targets-to-menu', arg);
  ipcMain.on('targets-to-menu', ttm);  
  
  // ------- CLOSE PROCESS
  menuWindow.on('close', () => { // mostrar tela inicial quando overlay for fechado
    ipcMain.removeHandler('getTargetsFile');
    ipcMain.removeListener('menu-to-targets', mtt);
    ipcMain.removeListener('targets-to-menu', ttm);
    overlayWindow.close();
    mainWindow.show();
  })
}

module.exports = { openOverlay }