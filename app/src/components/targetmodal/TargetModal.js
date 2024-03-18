import { useState, useEffect } from "react";
import { CirclePlus } from 'lucide-react';

  // posX, posY
  // sizeX, sizeY
  // freq
  // cmd
  // ? format
  // ? colors
  // ? freq phase

export default function TargetModal({params, setParams}) {
  const [formValues, setFormValues] = useState(null);

  useEffect(() => {
    setFormValues({
      posX: params.mode === 'new' ? parseFloat((params.event.clientX / window.innerWidth * 100).toFixed(1)) : params.target.posX,
      posY: params.mode === 'new' ? parseFloat((params.event.clientY / window.innerHeight * 100).toFixed(1)) : params.target.posY,
      sizeX: params.mode === 'new' ? 5 : params.target.sizeX,
      sizeY: params.mode === 'new' ? 5 : params.target.sizeY,
      freq: params.mode === 'new' ? 10 : params.target.freq,
      cmd: params.mode === 'new' ? '' : params.target.cmd,
    })
  }, [params]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleKeyDown = (event) => {
    event.preventDefault();
    let keyName = event.key;
    if (keyName === ' ') {
      keyName = 'Space';
    }
    setFormValues({ ...formValues, cmd: keyName });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (params.mode === 'new') {
      params.onSuccess(crypto.randomUUID(), formValues);
    } else {
      params.onSuccess(params.target.id, formValues)
    }
  };
  
  return formValues && (
    <dialog open={params.open} className="modal">
      <div className="modal-box">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => params.onClose()}>✕</button>
        <h3 className="font-bold text-lg">
          {params.mode === 'new' ? "Criar Target" : "Editar Target"}
        </h3>
        <div className="divider"/>
        
        <form onSubmit={handleSubmit}> 
          <div className="grid grid-cols-2 gap-4">

            {/* posicao */}
            <div className="flex flex-col gap-2">
              <span className="label-text">Posição</span>            
              <label className="input input-bordered input-sm flex items-center gap-2 overflow-hidden">
                X:
                <input
                  type="number"
                  className="grow" 
                  id="posX"
                  name="posX"
                  step={0.1}
                  min={0}
                  max={100}
                  onChange={handleChange}
                  value={formValues.posX}
                  required
                />
              </label>
              <label className="input input-bordered input-sm flex items-center gap-2 overflow-hidden">
                Y:
                <input
                  type="number"
                  className="grow"
                  id="posY"
                  name="posY"
                  step={0.1}
                  min={0}
                  max={100}
                  onChange={handleChange}
                  value={formValues.posY}
                  required
                />
              </label>
            </div>

            {/* tamanho */}
            <div className="flex flex-col gap-2">
              <span className="label-text">Tamanho</span>            
              <label className="input input-bordered input-sm flex items-center gap-2 overflow-hidden">
                X:
                <input
                  type="number"
                  className="grow" 
                  id="sizeX"
                  name="sizeX"
                  step={0.1}
                  min={0.1}
                  max={100}
                  onChange={handleChange}
                  value={formValues.sizeX}
                  required
                />
              </label>
              <label className="input input-bordered input-sm flex items-center gap-2 overflow-hidden">
                Y:
                <input
                  type="number"
                  className="grow"
                  id="sizeY"
                  name="sizeY"
                  step={0.1}
                  min={0.1}
                  max={100}
                  onChange={handleChange}
                  value={formValues.sizeY}
                  required
                />
              </label>
            </div>

            {/* Frequencia */}
            <div className="flex flex-col gap-2">
              <span className="label-text">Frequencia</span>            
              <label className="input input-bordered input-sm flex items-center gap-2 overflow-hidden">
                Hz:
                <input
                  type="number"
                  className="grow" 
                  id="freq"
                  name="freq"
                  step={0.1}
                  min={1}
                  max={100}
                  onChange={handleChange}
                  value={formValues.freq}
                  required
                />
              </label>
            </div>

            {/* Comando */}
            <div className="flex flex-col gap-2">
              <span className="label-text">Comando</span>            
              <label className="input input-bordered input-sm flex items-center gap-2 overflow-hidden">
                <kbd className="kbd kbd-sm">⌘</kbd>
                <input
                  type="text"
                  className="grow" 
                  id="cmd"
                  name="cmd"
                  placeholder="Pressione uma tecla..."
                  onKeyDown={handleKeyDown}
                  value={formValues.cmd}
                  required
                  readOnly
                />
              </label>
            </div>
          </div>

          <div className="modal-action">
            <button className="btn btn-neutral" type="submit">
              <CirclePlus size={20}/>Novo Target
            </button>
          </div>
        </form>

      </div>
    </dialog>
  )
};