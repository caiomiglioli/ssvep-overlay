const { parentPort } = require("worker_threads");
const zmq = require("zeromq");
const robot = require("robotjs");

let sockets = {};

async function startPipeline(targets) {
  // Inicializa os sockets para os módulos Python
  sockets.classifier = new zmq.Subscriber();
  sockets.classifier.connect("tcp://127.0.0.1:5557");
  sockets.classifier.subscribe("");
  console.log("Inscrito para receber dados do módulo de captura...");
  console.log("Pipeline", targets);

  // Processa os dados recebidos continuamente
  for await (const [msg] of sockets.classifier) {
    const data = JSON.parse(msg.toString());
    // console.log("Dados recebidos do módulo de classificao:", data);

    const targetName = data.prediction;
    const target = targets[targetName] ?? null;

    if (target) {
      // console.log("Target selecionado:", targetName, "keyTap:", target.cmd);
      if (target.cmd) robot.keyTap(target.cmd);
      parentPort.postMessage({ type: "keytap", target: targetName, cmd: target.cmd });
    }
  }
}

function stopPipeline() {
  Object.values(sockets).forEach((socket) => socket.close());
  sockets = {};
  parentPort.postMessage({ status: "stop" });
}

// Escuta mensagens do processo principal
parentPort.on("message", (message) => {
  if (message.action === "start") {
    startPipeline(message.config);
  } else if (message.action === "stop") {
    stopPipeline();
  }
});

/** 
config type

{
  "targets": {
    "dfb904c2-6afb-49ce-9888-d013ead36bb0": {
      "posX": 88.1,
      "posY": 28.7,
      "sizeX": 5,
      "sizeY": 5,
      "freq": 10,
      "cmd": ""
    },
    "97b3d8d1-c40c-46ed-82f5-30c33ea0fa43": {
      "posX": 11.3,
      "posY": 31.1,
      "sizeX": 5,
      "sizeY": 5,
      "freq": "5",
      "cmd": ""
    }
  },
  "modules": {
    "listener": {
      "name": "OpenBCI_LSL",
      "params": { "stream_name": "obci_eeg1", "electrodes": 4, "freq": 256, "overlap": 50, "publish_interval": 2 }
    },
    "treatment": { "name": "PSDMultitaper", "params": { "freq": 256, "lowcut": 5, "highcut": 12 } },
    "classifier": { "name": "MaxAmplitude", "params": { "threshold": 0.5 } }
  }
}
  */
