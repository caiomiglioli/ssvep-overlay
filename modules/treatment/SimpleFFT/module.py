from modules.treatment.base_module import BaseTreatmentModule
import numpy as np

class FFTProcessorModule(BaseTreatmentModule):
    def __init__(self):
        super().__init__()

    def process_data(self, data):
        """Aplica FFT aos dados recebidos."""
        try:
            signal = np.array(data["data"])
            fft_result = np.fft.fft(signal)
            magnitude = np.abs(fft_result) 
            return {"timestamp": data["timestamp"], "data": magnitude.tolist()}
        except Exception as e:
            print(f"Erro no módulo de FFTProcessorModule: {e}")
    
    def cleanup(self):
        """Libera recursos do módulo."""
        pass

def start_module(params):
    module = FFTProcessorModule()
    module.run()
