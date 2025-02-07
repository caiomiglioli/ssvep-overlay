const { ipcMain, BrowserWindow, screen, Tray, Menu, dialog } = require("electron");
const { writeFileSync } = require("fs");
const path = require("path");
const url = require("url");
const { getModules } = require("./modules");
const { stopModules, startModules } = require("../../background/modules");

/*
  Se colocar como alwaysontop e focusable no browserwindow, buga a tela
  por isso deve-se colocar manualmente.

  A tela irá começar no modo edição, cujo não é alwaysontop e é focusable,
  e ao clicar no tray, irá iniciar o modo execução, onde é alwaysontop e não é focusable
*/

// Inicializa o estado global de configuração dos módulos
global.targetsConfig = {
  targets: {},
  modules: {},
};

function createWindow() {
  const window = new BrowserWindow({
    title: "SSVEP Overlay",
    closable: false,
    frame: false,
    transparent: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  window.setBounds(screen.getPrimaryDisplay().workArea);
  window.name = "targets";

  window.loadURL(
    url.format({
      pathname: path.join(process.cwd(), "./app/build/index.html"),
      protocol: "file:",
      slashes: true,
      hash: "/targets",
    })
  );

  // window.webContents.openDevTools();
  // window.loadURL("http://localhost:3000/targets/");

  return window;
}

function createTray(window) {
  try {
    let tray = new Tray(path.join("", "./logo.png"));
    tray.setToolTip("SSVEP Overlay");

    let trayMenu = Menu.buildFromTemplate([
      {
        label: "SSVEP Overlay v0.0.1",
        enabled: false,
      },
      {
        label: "Alternar Modo Edição",
        type: "checkbox",
        checked: true,
        click: (menuItem) => setEditmode(window, menuItem.checked),
      },
      {
        label: "Sair",
        click: () => window.close(),
      },
    ]);

    tray.setContextMenu(trayMenu);
    return tray;
  } catch (e) {
    return null;
  }
}

function setEditmode(window, active) {
  window.setFocusable(active);
  window.setIgnoreMouseEvents(!active);
  window.setAlwaysOnTop(!active, "normal");
  window.webContents.send("targets:editmode", active);

  const onError = (error, moduleName = null) => {
    window.setFocusable(true);
    window.setIgnoreMouseEvents(false);
    window.setAlwaysOnTop(false, "normal");
    window.webContents.send("targets:editmode", true);
    window.webContents.send("targets:error", error.message);
    stopModules();
    console.log({ type: "Erro no Pipeline", module: moduleName, msg: error.message, error: error });
  };

  try {
    if (active) stopModules();
    else startModules(onError, global.targetsConfig);
  } catch (e) {
    onError(e, "setEditmode");
  }
}

function saveConfig(targets, modules, filepath) {
  try {
    const path = dialog.showSaveDialogSync({
      title: "SSVEP-Overlay: Guardar configurações",
      defaultPath: filepath || "./ssvep-overlay-preset.json",
      properties: ["showOverwriteConfirmation"],
      nameFieldLabel: "overlay-preset.json",
      filters: [{ name: "JSON file", extensions: ["json"] }],
    });
    if (path) {
      const file = writeFileSync(
        path,
        JSON.stringify({
          overlay: "0.0.1",
          targets: targets,
          modules: modules,
        })
      );
      return "success";
    }
    return "cancel";
  } catch (e) {
    return "error";
  }
}

function createTargetsWindow(config, path = null) {
  // ---------------- HIDE MAIN WINDOW
  const mainWindow = BrowserWindow.getAllWindows().find((win) => win.name === "main");
  mainWindow.hide();

  // ---------------- create targets window and control tray
  const window = createWindow();
  const tray = createTray(window);
  setEditmode(window, true);

  // ---------------- ipc on
  ipcMain.handle("overlay:exit", () => window.close());
  ipcMain.handle("config:save", (_, targets, modules) => saveConfig(targets, modules, path));
  ipcMain.handle("config:update", (_, targets, modules) => (global.targetsConfig = { targets, modules }));
  ipcMain.handle("targets:get", () => config.targets);
  ipcMain.handle("modules:get", () => config.modules);
  ipcMain.handle("modules:getAvailable", () => getModules());

  // ---------------- ipc off
  window.on("close", () => {
    stopModules();
    ipcMain.removeHandler("overlay:exit");
    ipcMain.removeHandler("config:save");
    ipcMain.removeHandler("config:update");
    ipcMain.removeHandler("targets:get");
    ipcMain.removeHandler("modules:get");
    ipcMain.removeHandler("modules:getAvailable");
    // ipcMain.removeListener('targets-to-menu', ttm);
    if (tray) tray.destroy();
    if (mainWindow) mainWindow.show();
  });
}

module.exports = { createTargetsWindow };
