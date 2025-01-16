from modules.listener.base_module import BaseListenerModule
from pylsl import StreamInlet, resolve_streams
import time

class LSLModule(BaseListenerModule):
    def __init__(self, stream_name=None, publish_interval=5):
        """
        Módulo LSL.
        Args:
            stream_name (str): Nome da stream LSL (opcional).
            publish_interval (int): Intervalo (em segundos) para publicar os dados acumulados.
        """
        super().__init__()
        self.stream_name = stream_name
        self.publish_interval = publish_interval
        self.inlet = None
        self.buffer = [[] for _ in range(4)]

        # Resolve a stream LSL
        streams = resolve_streams()
        for stream in streams:
            if not self.stream_name or stream.name() == self.stream_name:
                self.inlet = StreamInlet(stream)
                print(f"Conectado à stream LSL: {stream.name()} ({stream.type()})")
                break

        if not self.inlet:
            raise ValueError(f"Stream LSL '{self.stream_name}' não encontrada.")
    #end init

    def run(self):
        """
        Loop principal do módulo.
        Recebe dados via LSL e acumula no buffer, publicando periodicamente.
        """
        last_publish_time = time.time()
        try:
            while True:
              # Recebe dados da stream LSL
              sample, timestamp = self.inlet.pull_sample(timeout=1.0)
              if sample:
                #   print(f"Amostra recebida: {sample} (Buffer: {len(self.buffer)})")
                for i, value in enumerate(sample):
                    self.buffer[i].append(value)

              # Publica os dados se o intervalo foi atingido
              if time.time() - last_publish_time >= self.publish_interval:
                  self.publish_data({"timestamp": timestamp, "data": self.buffer})
                  self.buffer = [[] for _ in range(4)]  # Limpa o buffer
                  last_publish_time = time.time()

        except Exception as e:
            print(f"Erro no LSLModule: {e}")
        finally:
            self.cleanup()
    #end run

    def cleanup(self):
        """Libera recursos do módulo."""
        self.inlet = None
    #end cleanup
#end class

# ----------------------------------------------------------
def start_module(params):
    """
    Função padrão para iniciar o módulo.
    Args:
        params (dict): Parâmetros do módulo.
    """
    stream_name = params.get("stream_name", "obci_eeg1")
    publish_interval = params.get("publish_interval", 1)

    module = LSLModule(stream_name, float(publish_interval))
    module.run()
#end start module
