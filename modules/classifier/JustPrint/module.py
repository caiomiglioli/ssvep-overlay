from modules.classifier.base_module import BaseClassifierModule
import numpy as np

class JPClassifierModule(BaseClassifierModule):
    def __init__(self):
        super().__init__()

    def classify_data(self, data):
        """Classifica os dados processados."""
        features = np.array(data["data"]).reshape(1, -1)
        return {"timestamp": data["timestamp"], "prediction": features.shape}
    
    def cleanup(self):
        """Libera recursos do módulo."""
        pass


def start_module(params):
    module = JPClassifierModule()
    module.run()
