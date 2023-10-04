'use strict';

const { app, BrowserWindow } = require('electron')
const path = require('path')
const createWindow = require('./src/pages/index')

//auto reload
const env = process.env.NODE_ENV || 'development';
  
// If development environment
// if (env === 'development') {
//     try {
//         require('electron-reloader')(module, {
//             debug: true,
//             watchRenderer: true,
//             hardResetMethod: 'exit'
//         });
//     } catch (_) { console.log('Error'); }    
// }

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})