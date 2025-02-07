from modules.classifier.base_module import BaseClassifierModule
import numpy as np

class MaxAmplitudeClassifierModule(BaseClassifierModule):
    def __init__(self, targets={}, freq_threshold=0.5, verbose=False):
        super().__init__()
        self.targets = targets
        self.freq_threshold = freq_threshold
        self.verbose = verbose

    def classify_data(self, data):
        """Classifica os dados processados."""
        # Passo 1: Calcular a média dos canais
        data_np = np.array(data["data"])
        mean_amplitude = np.mean(data_np, axis=0)

        # Passo 2: Obtém a frequência correspondente e o valor da maior amplitude
        max_index = np.argmax(mean_amplitude)
        max_frequency = data["freqs"][max_index]
        max_amplitude = mean_amplitude[max_index]

        # Passo 3: Calcular a diferença da frequência máxima com a dos targets
        closest_target_uuid = None
        min_freq = None
        min_difference = float('inf')  # Inicializa com infinito para garantir que o primeiro valor será aceito

        for uuid, target in self.targets.items():
            freq_difference = abs(max_frequency - float(target['freq']))
            
            # Verifica se a diferença é a menor encontrada até agora e menor que o threshold
            if freq_difference < self.freq_threshold and freq_difference < min_difference:
                min_difference = freq_difference
                closest_target_uuid = uuid
                min_freq = target['freq']

        if self.verbose:
            print({"type": "classifier", "timestamp": data["timestamp"], "prediction": closest_target_uuid, "prediction_freq": min_freq, "freq_threshold": self.freq_threshold, "max_frequency": max_frequency, "max_amplitude": max_amplitude})
        
        # Deve ser retornato "prediction" contendo o ID do target predito
        if closest_target_uuid is not None:
            return {"timestamp": data["timestamp"], "prediction": closest_target_uuid, "prediction_freq": min_freq, "freq_threshold": self.freq_threshold, "max_frequency": max_frequency, "max_amplitude": max_amplitude}
        return None # return None para não enviar nada ao pipeline
    
    def cleanup(self):
        """Libera recursos do módulo."""
        pass


def start_module(params):
    targets = params.get("targets", {})
    freq_threshold = params.get("freq_threshold", 0.5)
    verbose = params.get("verbose", False)
    module = MaxAmplitudeClassifierModule(targets, float(freq_threshold), bool(verbose))
    module.run()
