const { BrowserWindow, ipcMain, dialog } = require("electron");
const { createTargetsWindow } = require("../targets");
const { readFileSync } = require("fs");
const path = require("path");
const url = require("url");

function createWindow() {
  const window = new BrowserWindow({
    title: "SSVEP Overlay",
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  window.setMenu(null);
  window.name = "main";

  // window.loadURL(url.format({
  //   pathname: path.join(process.cwd(), './app/build/index.html'),
  //   protocol: 'file',
  // }));

  window.webContents.openDevTools();
  window.loadURL("http://localhost:3000");

  return window;
}

function openTargetsWindow(window) {
  const path = dialog.showOpenDialogSync(window, {
    title: "SSVEP-Overlay: Abrir arquivo",
    properties: ["openFile"],
    filters: [{ name: "JSON", extensions: ["json"] }],
  });

  if (path) {
    const file = JSON.parse(readFileSync(path[0]));

    if (!file.overlay || !file.targets || !file.modules) {
      return dialog.showErrorBox(
        "Erro ao abrir arquivo de configuração.",
        `O arquivo ${path[0].split("/").pop()} não é um arquivo de configuração válido.`
      );
    }

    createTargetsWindow({ targets: file.targets, modules: file.modules }, path[0]);
  }
}

function createMainWindow() {
  const window = createWindow();

  // ---------------- ipc on
  ipcMain.handle("overlay:new", () => createTargetsWindow({ targets: {}, modules: {} }));
  ipcMain.handle("overlay:open", () => openTargetsWindow(window));

  // ---------------- ipc off
  window.on("close", () => {
    ipcMain.removeHandler("overlay:new");
    ipcMain.removeHandler("overlay:open");
  });
}

module.exports = { createMainWindow };
