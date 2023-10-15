// variaveis
const page = document.getElementById('page');
const modeText = document.getElementById('mode-text');
const targetDialog = document.getElementById('target-dialog');
const btnCloseTargetDialog = document.getElementById('close-target-dialog');

var isInEditMode = false;
var targets = [];

// funcoes
(async () => {
  const ssvepConfig = await window.ipc.getTargetsFile()
  document.getElementById('show-data').innerText = JSON.stringify(ssvepConfig)
})();

// ============== COMUNICAÇÃO
// event listeners
ipc.on('menu-to-targets', (event, message) => {
  if (message.cmd == 'run') {
    isInEditMode = false;
    modeText.innerText = '[SSVEP OVERLAY] Executando...';
  }

  if (message.cmd == 'new-target') {
    isInEditMode = 'new-target';
    modeText.innerText = '[MODO EDIÇÃO] Use o click do mouse para adicionar novo target!';
  }
});

// ============== DIALOG
// abrir dialog
page.addEventListener('click', (event) => {
  if (event.button != 0) return;
  if (!isInEditMode) return;
  if (targetDialog.open) return;

  if (isInEditMode == 'new-target'){
    handleTargetDialog('new', event)
  }
});

// executar dialog
const handleTargetDialog = (id, event) => {
  //if id = new, entao setar cfg padrao
  //event.x, event.y

  //else if id = exist, entao setar cfg do target existente
  
  //consigo pegar ele como propriedade, e se for = new, entao criar novo target, caso contrario, editar o target
  targetDialog.targetID = id;
  
  targetDialog.showModal();
}

// fechar dialog
const handleTargetDialogSubmit = (e) => {
  if (e.submitter.name == 'confirm'){
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    console.log(formData, formProps)

  } else if (e.submitter.name == 'cancel'){
    console.log('cancel')
  }

  targetDialog.close();
}