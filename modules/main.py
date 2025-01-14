import sys
import os
import json
import importlib.util

# Adiciona o diretório raiz ao sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

def load_module(group, module_name, params):
    """
    Carrega dinamicamente o módulo Python com base no subgrupo e no nome do módulo.
    Args:
        group (str): Subgrupo do módulo (ex.: "listener", "classifier", "processor").
        module_name (str): Nome da pasta do módulo (ex.: "lsl", "knn").
        params (dict): Parâmetros passados para o módulo.
    """
    module_path = os.path.join("modules", group, module_name, "module.py")
    if not os.path.exists(module_path):
        raise FileNotFoundError(f"O módulo '{module_name}' no grupo '{group}' não foi encontrado.")

    # Carregar o módulo dinamicamente
    spec = importlib.util.spec_from_file_location(module_name, module_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    # Instanciar o módulo usando a função padrão
    if hasattr(module, "start_module"):
        module.start_module(params)
    else:
        raise AttributeError(f"O módulo '{module_name}' no grupo '{group}' não possui a função 'start_module'.")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: python main.py <grupo> <nome_do_modulo> <parametros_em_json>")
        print("Exemplo: python main.py listener lsl '{\"stream_name\":\"EEG\",\"publish_interval\":5}'")
        sys.exit(1)

    group = sys.argv[1]        # Grupo do módulo (ex.: "listener")
    module_name = sys.argv[2]  # Nome do módulo (ex.: "lsl")
    params = json.loads(sys.argv[3]) if len(sys.argv) > 3 else {}

    try:
        # Carregar e iniciar o módulo
        load_module(group, module_name, params)
    except Exception as e:
        print(f"Erro ao iniciar o módulo '{module_name}' no grupo '{group}': {e}")
        sys.exit(1)
