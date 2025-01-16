import { useEffect, useState } from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { CirclePlus, BrainCircuit, ArrowDownToLine } from "lucide-react";
import TargetModal from "../../components/targetmodal/TargetModal";
import Target from "../../components/target/Target";
import ModulesModal from "../../components/modulesmodal/ModulesModal";
import "./Targets.css";

export default function Targets() {
  const [inEditmode, setInEditmode] = useState(true);
  const [toast, setToast] = useState(null);

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Modules specific
  const [modules, setModules] = useState({});
  const [avModules, setAvModules] = useState([]);
  const [mmParams, setMmParams] = useState({ open: false });

  const updateModules = (modules) => {
    setModules({
      listener: modules.listener,
      treatment: modules.treatment,
      classifier: modules.classifier,
    });
    setMmParams({ open: false });
    setToast(
      <div className="alert alert-success">
        <span>Módulos atualizados com sucesso!</span>
      </div>
    );
    setTimeout(() => setToast(null), 2000);
  };

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Targets specific
  const [targets, setTargets] = useState({});
  const [tmParams, setTmParams] = useState({ open: false });

  const updateTargets = (id, target) => {
    setTargets((prevState) => ({
      ...prevState,
      [id]: target,
    }));
    setTmParams({ open: false });
    setToast(
      <div className="alert alert-success">
        <span>Targets atualizados com sucesso!</span>
      </div>
    );
    setTimeout(() => setToast(null), 2000);
  };

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ context menu functions
  const openModulesModal = () => {
    setMmParams({
      open: true,
      availableModules: avModules,
      modules: modules,
      onClose: () => setMmParams({ open: false }),
      onSuccess: updateModules,
    });
  };

  const createNewTarget = (e) => {
    setTmParams({
      open: true,
      event: e,
      mode: "new",
      onClose: () => setTmParams({ open: false }),
      onSuccess: updateTargets,
    });
  };

  const editTarget = (id, params) => {
    setTmParams({
      open: true,
      target: { id, ...params },
      mode: "edit",
      onClose: () => setTmParams({ open: false }),
      onSuccess: updateTargets,
    });
  };

  const removeTarget = (id) => {
    setTargets((prevState) => {
      const newState = { ...prevState };
      delete newState[id];
      return newState;
    });
  };

  const saveTargets = async () => {
    const result = await window.targets.save(targets, modules);
    if (result === "success") {
      setToast(
        <div className="alert alert-success">
          <span>Arquivo salvo com sucesso!</span>
        </div>
      );
    } else if (result === "cancel") {
      setToast(
        <div className="alert alert-info">
          <span>Cancelado.</span>
        </div>
      );
    } else {
      setToast(
        <div className="alert alert-error">
          <span>Falha ao salvar arquivo.</span>
        </div>
      );
    }
    setTimeout(() => setToast(null), 2000);
  };

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ on page start
  useEffect(() => {
    // fetch targets
    (async () => {
      const [presetTargets, presetModules, availableModules] = await Promise.all([
        window.targets.get(),
        window.targets.getModules(),
        window.targets.getAvailableModules(),
      ]);
      setTargets(presetTargets);
      setModules(presetModules);
      setAvModules(availableModules);
    })();

    // toggle edit mode
    const toggleEditModeCallback = (event, enabled) => setInEditmode(enabled);
    window.targets.onEditmode(toggleEditModeCallback);
    return () => {
      window.targets.offEditmode(toggleEditModeCallback);
    };
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden">
      {/* alert  */}
      {inEditmode && (
        <p className="bg-primary text-secondary-content text-xs P-1">
          [ ! ] MODO EDIÇÃO ATIVADO: VOCÊ PODE DESATIVÁ-LO ATRAVÉS DO ÍCONE DE BANDEJA
        </p>
      )}

      {/* modals */}
      {mmParams.open && <ModulesModal params={mmParams} />}
      {tmParams.open && <TargetModal params={tmParams} />}
      {toast && <div className="toast toast-end">{toast}</div>}

      <ContextMenu.Root>
        {/* page content */}
        <ContextMenu.Trigger asChild>
          <div className="w-full h-full">
            {Object.entries(targets).map(([key, value]) => (
              <Target key={key} id={key} params={value} editTarget={editTarget} removeTarget={removeTarget} />
            ))}
          </div>
        </ContextMenu.Trigger>

        {/* context menu content */}
        <ContextMenu.Portal>
          <ContextMenu.Content className="menu bg-base-200 w-56 rounded-box" sideOffset={5} align="end">
            <ContextMenu.Item onClick={createNewTarget} asChild>
              <li>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a className="w-full flex justify-between">
                  Criar Target <CirclePlus size={16} />
                </a>
              </li>
            </ContextMenu.Item>

            <ContextMenu.Item onClick={openModulesModal} asChild>
              <li>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a className="w-full flex justify-between">
                  Configurar Dispositivo <BrainCircuit size={16} />
                </a>
              </li>
            </ContextMenu.Item>

            <ContextMenu.Item onClick={saveTargets} asChild>
              <li>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a className="w-full flex justify-between">
                  Guardar Configurações <ArrowDownToLine size={16} />
                </a>
              </li>
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>
    </div>
  );
}
