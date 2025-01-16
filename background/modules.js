const { spawn } = require("child_process");
const { Worker } = require("worker_threads");

// config = {
//   targets: {
//     "70f00382-8c77-4d66-992a-7a5211ffbbf6": { posX: 83.3, posY: 14.9, sizeX: 5, sizeY: 5, freq: 10, cmd: "" },
//   },
//   modules: {
//     listener: { name: "OpenBCI_LSL", params: { stream_name: "EEG", publish_interval: 5 } },
//     treatment: { name: "SimpleFFT", params: { stream_name: "EEG" } },
//     classifier: { name: "JustPrint", params: { stream_name: "EEG" } },
//   },
// };

let captureModule = null;
let treatmentModule = null;
let classifierModule = null;
let pipelineWorker = null;

function startModules(onError, config) {
  console.log({ startModulesConfig: JSON.stringify(config) });

  if (!config.modules.listener || !config.modules.treatment || !config.modules.classifier) {
    throw new Error("Módulos não instanciados");
  }

  // Iniciar módulos
  if (!captureModule) {
    captureModule = spawn(
      "python",
      [
        "-u",
        "modules/main.py",
        "listener",
        config.modules.listener.name,
        JSON.stringify(config.modules.listener.params),
      ],
      { stdio: ["pipe", "pipe", "pipe"] }
    );

    // por algum motivo se não deixar isso aqui on, trava
    captureModule.stdout.on("data", (data) => {
      console.log(`Módulo de captura: ${data.toString()}`);
    });

    // Captura erros do processo Python (stderr)
    // captureModule.stderr.on("data", (data) => {
    //   onError(new Error(data.toString()), "captura1");
    // });

    // Captura erros na criação do processo
    captureModule.on("error", (error) => {
      onError(error, "captura2");
    });

    // Captura quando o processo finaliza inesperadamente
    captureModule.on("close", (code) => {
      if (code !== 0) {
        onError(new Error(`Encerrado com código ${code}`), "captura3");
      }
    });
  }

  if (!treatmentModule) {
    treatmentModule = spawn(
      "python",
      [
        "-u",
        "modules/main.py",
        "treatment",
        config.modules.treatment.name,
        JSON.stringify(config.modules.treatment.params),
      ],
      {
        stdio: ["pipe", "pipe", "pipe"],
      }
    );

    // por algum motivo se não deixar isso aqui on, trava
    treatmentModule.stdout.on("data", (data) => {
      console.log(`Módulo de processamento: ${data.toString()}`);
    });

    // Captura erros do processo Python (stderr)
    treatmentModule.stderr.on("data", (data) => {
      onError(new Error(data.toString()), "processamento");
    });

    // Captura erros na criação do processo
    treatmentModule.on("error", (error) => {
      onError(error, "processamento");
    });

    // Captura quando o processo finaliza inesperadamente
    treatmentModule.on("close", (code) => {
      if (code !== 0) {
        onError(new Error(`Encerrado com código ${code}`), "processamento");
      }
    });
  }

  if (!classifierModule) {
    classifierModule = spawn(
      "python",
      [
        "-u",
        "modules/main.py",
        "classifier",
        config.modules.classifier.name,
        JSON.stringify(config.modules.classifier.params),
      ],
      {
        stdio: ["pipe", "pipe", "pipe"],
      }
    );

    // por algum motivo se não deixar isso aqui on, trava
    classifierModule.stdout.on("data", (data) => {
      console.log(`Módulo de classificação: ${data.toString()}`);
    });

    // Captura erros do processo Python (stderr)
    classifierModule.stderr.on("data", (data) => {
      onError(new Error(data.toString()), "classificação");
    });

    // Captura erros na criação do processo
    classifierModule.on("error", (error) => {
      onError(error, "classificação");
    });

    // Captura quando o processo finaliza inesperadamente
    classifierModule.on("close", (code) => {
      if (code !== 0) {
        onError(new Error(`Encerrado com código ${code}`), "classificação");
      }
    });
  }

  // Iniciar o pipeline
  if (!pipelineWorker) {
    pipelineWorker = new Worker("./background/pipeline.js");
    pipelineWorker.on("error", (err) => {
      onError(err, "Pipeline de Comando");
    });
    pipelineWorker.postMessage({ action: "start", config: {} });
    console.log("Pipeline iniciado.");
  }
}

function stopModules() {
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
}

module.exports = { stopModules, startModules };
