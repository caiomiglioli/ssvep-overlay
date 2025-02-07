const { parentPort } = require("worker_threads");
const zmq = require("zeromq");
const robot = require("robotjs");

let sockets = {};

async function startPipeline(config) {
  // Inicializa os sockets para os módulos Python
  sockets.classifier = new zmq.Subscriber();
  sockets.classifier.connect("tcp://127.0.0.1:5557");
  sockets.classifier.subscribe("");
  console.log("Inscrito para receber dados do módulo de captura...");

  // Processa os dados recebidos continuamente
  for await (const [msg] of sockets.classifier) {
    const data = JSON.parse(msg.toString());
    console.log("Dados recebidos do módulo de classificao:", data);
    robot.keyTap("B");
  }
}

function stopPipeline() {
  Object.values(sockets).forEach((socket) => socket.close());
  sockets = {};
  parentPort.postMessage({ status: "stopped" });
}

// Escuta mensagens do processo principal
parentPort.on("message", (message) => {
  if (message.action === "start") {
    startPipeline(message.config);
  } else if (message.action === "stop") {
    stopPipeline();
  }
});
