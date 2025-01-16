import { useState } from "react";
import { CircleCheckBig, ChevronRight } from "lucide-react";
import ModuleForm from "./moduleform";

/*
ModulesModal params type: 
{
  open: true,
  availableModules: avModules,
  modules: modules,
  onClose: () => setMmParams({ open: false }),
  onSuccess: updateModules,
}
*/

export default function ModulesModal({ params }) {
  const [listenerValues, setListenerValues] = useState(params["modules"]["listener"] ?? null);
  const [treatmentValues, setTreatmentValues] = useState(params["modules"]["treatment"] ?? null);
  const [classifierValues, setClassifierValues] = useState(params["modules"]["classifier"] ?? null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (listenerValues && treatmentValues && classifierValues) {
      params.onSuccess({
        listener: listenerValues,
        treatment: treatmentValues,
        classifier: classifierValues,
      });
    }
  };

  return (
    <dialog open={params.open} className="modal">
      <div className="modal-box max-w-[80vw]">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => params.onClose()}>
          ✕
        </button>
        <h3 className="font-bold text-lg">Configurar Fluxo de Sinal</h3>
        <div className="divider mt-0 mb-6 h-1" />

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-[1fr_20px_1fr_20px_1fr] gap-4 max-w-full">
            {/* modulo de captura  */}
            <div className="flex flex-col gap-2 max-w-full">
              <span className="label-text font-bold h-fit w-full">
                Módulo de Captura:
                <div className="divider divider-neutral my-0 h-1" />
              </span>

              <ModuleForm
                category="listener"
                allModules={params.availableModules}
                params={listenerValues}
                setParams={setListenerValues}
              />
            </div>

            <div className="card bg-base-300 static h-full justify-center ">
              <ChevronRight size={20} />
            </div>

            {/* modulo de processamento  */}
            <div className="flex flex-col gap-2  max-w-full">
              <span className="label-text font-bold h-fit w-full">
                Módulo de Processamento:
                <div className="divider divider-neutral my-0 h-1" />
              </span>

              <ModuleForm
                category="treatment"
                allModules={params.availableModules}
                params={treatmentValues}
                setParams={setTreatmentValues}
              />
            </div>

            <div className="card bg-base-300 static h-full justify-center ">
              <ChevronRight size={20} />
            </div>

            {/* modulo de Classificação  */}
            <div className="flex flex-col gap-2  max-w-full">
              <span className="label-text font-bold h-fit w-full">
                Módulo de Classificação:
                <div className="divider divider-neutral my-0 h-1" />
              </span>

              <ModuleForm
                category="classifier"
                allModules={params.availableModules}
                params={classifierValues}
                setParams={setClassifierValues}
              />
            </div>
          </div>

          <div className="modal-action">
            <button
              className="btn btn-neutral"
              type="submit"
              disabled={!listenerValues || !treatmentValues || !classifierValues}
            >
              <CircleCheckBig size={20} />
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
