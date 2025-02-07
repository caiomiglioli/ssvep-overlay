import zmq
import sys
import signal
from abc import ABC, abstractmethod

class BaseClassifierModule(ABC):
    ZMQ_SUB_PORT = 5556  # Porta fixa para receber dados processados
    ZMQ_PUB_PORT = 5557  # Porta para enviar as respostas ao Electron

    def __init__(self):
        self.context = zmq.Context()

        self.subscriber = self.context.socket(zmq.SUB)
        self.subscriber.connect(f"tcp://127.0.0.1:{self.ZMQ_SUB_PORT}")
        self.subscriber.subscribe("")  # Inscreve-se para receber todos os dados

        self.publisher = self.context.socket(zmq.PUB)
        self.publisher.bind(f"tcp://127.0.0.1:{self.ZMQ_PUB_PORT}")

        signal.signal(signal.SIGTERM, self._cleanup)
        signal.signal(signal.SIGINT, self._cleanup)

        print(f"{self.__class__.__name__} iniciado. Publicando em tcp://127.0.0.1:{self.ZMQ_SUB_PORT}")
        print(f"{self.__class__.__name__} iniciado. Publicando em tcp://127.0.0.1:{self.ZMQ_PUB_PORT}")

        self.running = True

    @abstractmethod
    def classify_data(self, data):
        """Método abstrato para classificar os dados recebidos."""
        pass

    @abstractmethod
    def cleanup(self):
        """
        Deve ser implementado pelo módulo específico.
        Callback chamado no encerramento do módulo
        """
        pass

    def run(self):
        """Loop principal do módulo."""
        try:
            while self.running:
                message = self.subscriber.recv_json()
                # print(f"Dados recebidos para classificação: {message}")
                classification = self.classify_data(message)
                if classification is not None:
                    self.publisher.send_json(classification)
                # print(f"Resultado da classificação enviado: {classification}")
        except Exception as e:
            print(f"Erro no módulo de classificação: {e}")
        finally:
            self._cleanup()

    def _cleanup(self, signal_received=None, frame=None):
        """Libera recursos e encerra o módulo."""
        try:
            print(f"Encerrando {self.__class__.__name__}...")
            self.running = False
            self.cleanup()
            self.subscriber.close()
            self.publisher.close()
            self.context.term()
        except Exception as e:
            print(f"{self.__class__.__name__}: Erro ao liberar recursos: {e}")
        finally:
            print(f"Encerrado {self.__class__.__name__}...")
            sys.exit(0)
