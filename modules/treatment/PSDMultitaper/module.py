from modules.treatment.base_module import BaseTreatmentModule
import numpy as np
import mne

class PSDProcessorModule(BaseTreatmentModule):
    def __init__(self, freq=256, lowcut=5, highcut=12, verbose=False):
        super().__init__()
        self.freq = freq
        self.lowcut = lowcut
        self.highcut = highcut
        self.verbose = verbose

    def process_data(self, data):
        """Aplica FFT aos dados recebidos."""
        try:
            signal = data["data"]
            processed = []
            frequencies = []
            
            for channel in signal:
                x_np = np.array(channel)
                psd, freqs = mne.time_frequency.psd_array_multitaper(x_np, sfreq=self.freq, fmin=self.lowcut, fmax=self.highcut, verbose=False)
                processed.append(psd.tolist())
                frequencies = freqs.tolist()
            
            if self.verbose:
                print({"type": "treatment", "timestamp": data["timestamp"], "sfreq": self.freq, "fmin": self.lowcut, "fmax": self.highcut, "freqs": frequencies, "data": processed})
            
            return {"timestamp": data["timestamp"], "freqs": frequencies, "data": processed}
        except Exception as e:
            print(f"Erro no módulo de FFTProcessorModule: {e}")
    
    def cleanup(self):
        """Libera recursos do módulo."""
        pass

def start_module(params):
    freq = params.get("freq", 256)
    lowcut = params.get("lowcut", 5)
    highcut = params.get("highcut", 12)
    verbose = params.get("verbose", False)
    module = PSDProcessorModule(int(freq), int(lowcut), int(highcut), bool(verbose))
    module.run()
