// 'use strict';

const { app, ipcMain, BrowserWindow } = require('electron');
const { openIndex } = require('./src/pages/index')
const { openOverlay } = require('./src/pages/overlay')

// --------------------------------
// LOAD INDEX PAGE
app.whenReady().then(() => {
  openIndex()
  // app.on('activate', () => {
  //   if (BrowserWindow.getAllWindows().length === 0) {
  //     index()
  //   }
  // })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


// --------------------------------
// IPC MAIN

ipcMain.on('openOverlay', async (event, mode) => {
  openOverlay(mode)
})