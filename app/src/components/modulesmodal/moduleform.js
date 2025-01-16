import { useState, useEffect } from "react";

/*
ModulesForm params type:
{
  name: <module-name>
  params: {
    <param-name>: <param-value>
  }
}

module type:
[
  {
    "category": "listener",
    "name": "OpenBCI_LSL",
    "config": {
      "name": "LSL Module",
      "description": "Recebe dados via LSL e publica via ZeroMQ.",
      "fields": [
        {
          "name": "stream_name",
          "type": "string",
          "label": "Nome da Stream",
          "default": "EEG"
        },
      ]
    }
  },
]
*/

export default function ModuleForm({ category, allModules, params, setParams }) {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("");
  const [moduleType, setModuleType] = useState(null);
  const [moduleParams, setModuleParams] = useState(null);

  // select modules that fits this category
  const avModules = allModules.filter((m) => m.category === category);

  // insert module preset info into usestates
  useEffect(() => {
    if (params) {
      setSelectedAlgorithm(params.name);
      setModuleParams(params.params);
      setModuleType(avModules.find((m) => m.name === params.name));
    }
  }, []);

  // update global parameters
  useEffect(() => {
    if (moduleType && moduleParams) {
      setParams({
        name: moduleType.name,
        params: moduleParams,
      });
    }
  }, [moduleType, moduleParams]);

  // input handlers
  const handleSelectionChange = (e) => {
    const selectedValue = e.target.value;
    const selectedModule = avModules.find((m) => m.name === selectedValue);
    if (selectedModule) {
      setSelectedAlgorithm(selectedValue);
      setModuleType(selectedModule);

      const mp = selectedModule.config.fields.reduce((acc, field) => {
        acc[field.name] = field.default || ""; // Define o valor padrão ou vazio
        return acc;
      }, {});

      setModuleParams(mp);
    }
  };

  const handleFieldsChange = (e) => {
    const { name, value } = e.target;
    setModuleParams((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <div className="flex flex-col gap-2">
      <select
        className="select select-sm select-bordered w-full"
        value={selectedAlgorithm}
        onChange={handleSelectionChange}
      >
        <option disabled value="">
          Selecionar Algoritmo
        </option>
        {avModules.map((m) => (
          <option id={`${m.name}_${category}_modules`} key={m.name} value={m.name}>
            {m.name}
          </option>
        ))}
      </select>

      <span className="label-text font-bold h-fit w-full mt-2">
        Parâmetros:
        <div className="divider divider-neutral my-0 h-1" />
      </span>

      {/* posicao */}
      <div className="flex flex-col gap-2">
        {moduleType && moduleType.config.fields && moduleType.config.fields.length >= 1 ? (
          moduleType.config.fields.map((f) => (
            <div id={`${f.name}_${category}_params`} className="">
              <span className="label-text text-xs">{f.label}</span>
              <label className="input input-bordered input-sm flex items-center gap-2 overflow-hidden">
                {f.unit && `${f.unit}:`}
                <input
                  type={f.type}
                  className="grow"
                  // id={f.name}
                  name={f.name}
                  // step={0.1}
                  // min={0}
                  // max={100}
                  onChange={handleFieldsChange}
                  value={moduleParams[f.name]}
                />
              </label>
            </div>
          ))
        ) : (
          <span className="label-text text-xs w-full">Não há parâmetros configuráveis</span>
        )}
      </div>
    </div>
  );
}
