from modules.listener.base_module import BaseListenerModule
from pylsl import StreamInlet, resolve_streams
import time
class LSLModule(BaseListenerModule):
    def __init__(self, stream_name=None, electrodes=1, freq=256, overlap=50, publish_interval=2):
        """
        Módulo LSL.
        Args:
            stream_name (str): Nome da stream LSL (opcional).
            publish_interval (int): Intervalo (em segundos) para publicar os dados acumulados.
        """
        super().__init__()
        self.stream_name = stream_name
        self.electrodes = electrodes
        self.freq = freq
        self.overlap = overlap
        self.publish_interval = publish_interval
        print({ stream_name: self.stream_name, electrodes: self.electrodes, freq: self.freq, overlap: self.overlap, publish_interval: self.publish_interval})

        self.inlet = None
        self.buffer = [[] for _ in range(electrodes)]

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
        n_samples = 0
        max_samples = self.freq * self.publish_interval
        overlap_samples = int(max_samples * (self.overlap / 100))

        try:
            while True:
                # Recebe dados da stream LSL
                sample, timestamp = self.inlet.pull_sample(timeout=1.0)
                if sample:
                    for i, value in enumerate(sample):
                        self.buffer[i].append(value)
                    n_samples += 1

                # Publica os dados se o intervalo foi atingido
                if n_samples >= max_samples:
                    # print({"type": "listener", "n_samples": n_samples, "max_samples":max_samples, "overlap_samples":overlap_samples,"timestamp": timestamp, "data": self.buffer[0]})
                    self.publish_data({"timestamp": timestamp, "data": self.buffer})
                    self.buffer = [channel[-(overlap_samples + 1):] for channel in self.buffer] # Mantém apenas os últimos overlap_samples do buffer             
                    n_samples = overlap_samples # Reinicia a contagem

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
    electrodes = params.get("electrodes", 1)
    freq = params.get("freq", 256)
    overlap = params.get("overlap", 50)
    publish_interval = params.get("publish_interval", 2)

    module = LSLModule(stream_name, int(electrodes), int(freq), int(overlap), int(publish_interval))
    module.run()
#end start module
