const { ipcMain, BrowserWindow, screen, Tray, Menu, dialog } = require("electron");
const { writeFileSync } = require("fs");
const path = require("path");
const url = require("url");
const { spawn } = require("child_process");
const { Worker } = require("worker_threads");
const { getModules } = require("./modules");

/*
  Se colocar como alwaysontop e focusable no browserwindow, buga a tela
  por isso deve-se colocar manualmente.

  A tela irá começar no modo edição, cujo não é alwaysontop e é focusable,
  e ao clicar no tray, irá iniciar o modo execução, onde é alwaysontop e não é focusable
*/

let captureModule = null;
let treatmentModule = null;
let classifierModule = null;
let pipelineWorker = null;

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

  // window.loadURL(url.format({
  //   pathname: path.join(process.cwd(), './app/build/index.html'),
  //   protocol: 'file:',
  //   slashes: true,
  //   hash: '/targets',
  // }));

  window.webContents.openDevTools();
  window.loadURL("http://localhost:3000/targets/");

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

  try {
    if (active) {
      // Excluir módulos
      if (captureModule) {
        console.log("Encerrando captura para modo de edição...");
        captureModule.kill("SIGTERM");
        captureModule = null;
      }

      if (treatmentModule) {
        console.log("Encerrando tratamento para modo de edição...");
        treatmentModule.kill("SIGTERM");
        treatmentModule = null;
      }

      if (classifierModule) {
        console.log("Encerrando classificação para modo de edição...");
        classifierModule.kill("SIGTERM");
        classifierModule = null;
      }

      // Pausar o pipeline
      if (pipelineWorker) {
        pipelineWorker.postMessage({ action: "stop" });
        pipelineWorker.once("message", (message) => {
          if (message.status === "stopped") {
            pipelineWorker.terminate().then(() => (pipelineWorker = null));
            console.log("Finalização do Worker concluída.");
            console.log("Pipeline pausado.");
          }
        });
      }
    } else {
      // Iniciar módulos
      if (!captureModule) {
        captureModule = spawn(
          "python",
          [
            "-u",
            "modules/main.py",
            "listener",
            "OpenBCI_LSL",
            JSON.stringify({ stream_name: "obci_eeg1", publish_interval: 5 }),
          ],
          { stdio: ["pipe", "pipe", "pipe"] }
        );

        // por algum motivo se não deixar isso aqui on, trava
        captureModule.stdout.on("data", (data) => {
          console.log(`captureModule: ${data.toString()}`);
        });
      }

      if (!treatmentModule) {
        treatmentModule = spawn("python", ["-u", "modules/main.py", "treatment", "SimpleFFT"], {
          stdio: ["pipe", "pipe", "pipe"],
        });

        // por algum motivo se não deixar isso aqui on, trava
        treatmentModule.stdout.on("data", (data) => {
          console.log(`treatmentModule: ${data.toString()}`);
        });
      }

      if (!classifierModule) {
        classifierModule = spawn("python", ["-u", "modules/main.py", "classifier", "JustPrint"], {
          stdio: ["pipe", "pipe", "pipe"],
        });

        // por algum motivo se não deixar isso aqui on, trava
        classifierModule.stdout.on("data", (data) => {
          console.log(`classifierModule: ${data.toString()}`);
        });
      }

      // Iniciar o pipeline
      if (!pipelineWorker) {
        pipelineWorker = new Worker("./background/pipeline.js");
        pipelineWorker.on("error", (err) => setEditmode(window, true));
        pipelineWorker.postMessage({ action: "start", config: {} });
        console.log("Pipeline iniciado.");
      }
    }
  } catch (e) {
    console.log({ type: "Erro no Pipeline", msg: e.message, error: e });
    setEditmode(window, true);
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
  ipcMain.handle("targets:get", () => config.targets);
  ipcMain.handle("modules:get", () => config.modules);
  ipcMain.handle("modules:getAvailable", () => getModules());

  // ---------------- ipc off
  window.on("close", () => {
    ipcMain.removeHandler("overlay:exit");
    ipcMain.removeHandler("config:save");
    ipcMain.removeHandler("targets:get");
    ipcMain.removeHandler("modules:get");
    ipcMain.removeHandler("modules:getAvailable");
    // ipcMain.removeListener('targets-to-menu', ttm);
    if (tray) tray.destroy();
    if (mainWindow) mainWindow.show();
  });
}

module.exports = { createTargetsWindow };
