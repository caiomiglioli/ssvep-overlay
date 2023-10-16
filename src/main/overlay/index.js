const { BrowserWindow, dialog, ipcMain } = require('electron');
const fs = require('fs');
const {openOverlayMenu} = require('../../pages/overlayMenu')
const {openOverlayTargets} = require('../../pages/overlayTargets')

async function openOverlay(mode) {
  // ------- READ TARGETS FILE
  let config = {'targets': {}};
  
  if (mode == 'read'){ // read target file
    const file = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{name: 'JSON', extensions: ['json']}]
    });
    config = JSON.parse(fs.readFileSync(file.filePaths[0]));
    if (!config.overlay) return dialog.showErrorBox('Erro ao abrir arquivo de configuração.', `O arquivo ${file.filePaths[0].split('/').pop()} não é um arquivo de configuração válido.`);
  }
  
  // ------- OPEN OVERLAY
  menuWindow = openOverlayMenu();
  overlayWindow = openOverlayTargets(menuWindow);

  // ------- HIDE MAIN WINDOW
  mainWindow = BrowserWindow.getAllWindows().find(win => {return win.name === 'index';});
  mainWindow.hide();

  // ------- COMUNICATION
  ipcMain.handle('getTargetsFile', () => config.targets); // send info
  
  ipcMain.handle('exitOverlay', () => menuWindow.close()); // send info

  const mtt = (event, msg) => overlayWindow.webContents.send('menu-to-targets', msg);
  ipcMain.on('menu-to-targets', mtt);

  const ttm = (event, msg) => menuWindow.webContents.send('targets-to-menu', msg);
  ipcMain.on('targets-to-menu', ttm);  

  const toe = (event, toggle) => { //toggle = true ou false
    overlayWindow.setAlwaysOnTop(!toggle, "normal");
    overlayWindow.setIgnoreMouseEvents(!toggle);
    overlayWindow.setFocusable(toggle);
  };
  ipcMain.on('toggle-overlay-editmode', toe);
  
  // ------- CLOSE PROCESS
  menuWindow.on('close', () => { // mostrar tela inicial quando overlay for fechado
    ipcMain.removeHandler('getTargetsFile');
    ipcMain.removeHandler('exitOverlay');
    ipcMain.removeListener('menu-to-targets', mtt);
    ipcMain.removeListener('targets-to-menu', ttm);
    ipcMain.removeListener('toggle-overlay-editmode', toe);
    overlayWindow.close();
    mainWindow.show();
  })
}

module.exports = { openOverlay }