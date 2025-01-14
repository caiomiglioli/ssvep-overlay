import zmq
import signal
import sys
from abc import ABC, abstractmethod

class BaseListenerModule(ABC):
    ZMQ_SUB_PORT = 5555  # Porta fixa do ZeroMQ

    def __init__(self):
        """
        Classe base para módulos de captura de sinal.
        """
        self.context = zmq.Context()
        self.publisher = self.context.socket(zmq.PUB)
        self.publisher.bind(f"tcp://127.0.0.1:{self.ZMQ_SUB_PORT}")

        signal.signal(signal.SIGTERM, self._cleanup)
        signal.signal(signal.SIGINT, self._cleanup)
        
        print(f"{self.__class__.__name__} iniciado. Publicando em tcp://127.0.0.1:{self.ZMQ_SUB_PORT}")

    @abstractmethod
    def run(self):
        """
        Deve ser implementado pelo módulo específico.
        Cada módulo é responsável pelo seu próprio loop principal.
        """
        pass

    @abstractmethod
    def cleanup(self):
        """
        Deve ser implementado pelo módulo específico.
        Callback chamado no encerramento do módulo
        """
        pass

    def publish_data(self, data):
        """
        Envia os dados processados via ZeroMQ.
        Args:
            data (dict): Dados a serem enviados.
        """
        self.publisher.send_json(data)
        # print(f"Dados enviados Listener: {data}")

    def _cleanup(self, signal_received=None, frame=None):
        """Libera recursos e encerra o módulo."""
        try:
            print(f"Encerrando {self.__class__.__name__}...")
            self.cleanup()
            self.publisher.close()
            self.context.term()
        except Exception as e:
            print(f"{self.__class__.__name__}: Erro ao liberar recursos: {e}")
        finally:
            print(f"Encerrado {self.__class__.__name__}...")
            sys.exit(0)

