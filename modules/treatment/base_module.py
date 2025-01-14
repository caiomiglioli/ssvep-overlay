import zmq
import sys
import signal
from abc import ABC, abstractmethod

class BaseTreatmentModule(ABC):
    ZMQ_SUB_PORT = 5555  # Porta fixa para receber dados do módulo de captura
    ZMQ_PUB_PORT = 5556  # Porta fixa para enviar dados processados

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
    def process_data(self, data):
        """Método abstrato para processar os dados recebidos."""
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
                # print(f"Dados recebidos para processamento: {message}")
                processed_data = self.process_data(message)
                self.publisher.send_json(processed_data)
                # print(f"Dados processados enviados: {processed_data}")
        except Exception as e:
            print(f"Erro no módulo de processamento: {e}")
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
