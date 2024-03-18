import {CirclePlus, Upload, BrainCircuit,CircleHelp} from 'lucide-react';

function Main() {
  const handleNewFile = (e) => {
    e.preventDefault();
    window.overlay.new();
  } 
  const handleOpenFile = (e) => {
    e.preventDefault();
    window.overlay.open();
  } 

  return (
    <div className="w-screen h-screen p-10 bg-base-200">      
      <div className="card max-w-md mx-auto bg-base-100 shadow-xl p-6">

        <div className='mx-auto w-fit'>
          <h1 className="text-center font-bold text-3xl">SSVEP Overlay</h1>
          <p className='text-xs text-[10px] text-right'>v0.0.1</p>
        </div>

        <div className="divider"/>

        <div className='grid gap-2'>
          <button className="btn btn-neutral"
            onClick={handleNewFile}
          >
            <CirclePlus size={20}/>Novo Arquivo
          </button>

          <button className="btn btn-neutral"
            onClick={handleOpenFile}
          >
            <Upload size={20}/>Carregar Arquivo
          </button>

          <button className="btn btn-neutral">
            <BrainCircuit size={20}/>Conectar Dispositivo
          </button>

          <button className="btn btn-neutral">
            <CircleHelp size={20}/>Ajuda
          </button>
        </div>

      </div>
      {/* <p className="text-center text-xs pt-4 text-neutral-content">Por: Caio Miglioli</p> */}
    </div>
  );
}

export default Main;
