// 'use strict';

const { app, ipcMain, dialog } = require('electron');
const { openIndex } = require('./src/pages/index')
const { openOverlay } = require('./src/main/overlay')

// --------------------------------
// LOAD INDEX PAGE
app.whenReady().then(() => {
  openIndex()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


// --------------------------------
// IPC MAIN
ipcMain.handle('openOverlay', (event, mode) => {openOverlay(mode)})
ipcMain.handle('showSaveDialogSync', (e, cfg) => dialog.showSaveDialogSync(cfg));