// variaveis
const page = document.getElementById('page');
const modeText = document.getElementById('mode-text');
const targetDialog = document.getElementById('target-dialog');
const btnCloseTargetDialog = document.getElementById('close-target-dialog');

var isInEditMode = false;
// var targets = [];


// FETCH DATA -----------------------------------------------------------------------------------------
(async () => {
  const ssvepConfig = await window.ipc.getTargetsFile()
  document.getElementById('show-data').innerText = JSON.stringify(ssvepConfig)
})();


// COMUNICAÇÃO -----------------------------------------------------------------------------------------
// event listeners
ipc.on('menu-to-targets', (event, message) => {
  if (message.cmd == 'run') {
    isInEditMode = false;
    modeText.innerText = '[EXECUÇÃO] Executando...';
  }

  else if (message.cmd == 'new-target') {
    isInEditMode = 'new-target';
    modeText.innerText = '[EDIÇÃO] Clique no lugar desejado para adicionar novo target!';
  }

  else if (message.cmd == 'edit-target') {
    isInEditMode = 'edit-target';
    modeText.innerText = '[EDIÇÃO] Clique em um target para editá-lo!';
  }

  else if (message.cmd == 'del-target') {
    isInEditMode = 'del-target';
    modeText.innerText = '[EDIÇÃO] Clique em um target para removê-lo!';
  }
});


document.body.addEventListener('click', (event) => {
  if (event.button != 0) return;
  if (!isInEditMode) return;
  if (targetDialog.open) return;

  if (isInEditMode == 'new-target'){
    handleTargetDialog('new-target', event)
  }

  else if (isInEditMode == 'edit-target'){
    if (!event.target.isTarget) return;
    handleTargetDialog(event.target.id, event)
  }

  else if (isInEditMode == 'del-target'){
    if (!event.target.isTarget) return;
    delTarget(event.target.id);
  }
});


// DIALOG -----------------------------------------------------------------------------------------

// executar dialog
const handleTargetDialog = (id, event) => {
  console.log(event)
  let props = {};

  // caso nao for uma new target, alterar os valores das propriedadades
  if (id != 'new-target'){
    const target = event.target;
    const allButNumber = /[^0-9.]/g;

    props = {
      'posx': target.style.top.replace(allButNumber, ''),
      'posy': target.style.left.replace(allButNumber, ''),
      'sizex': target.style.minWidth.replace(allButNumber, ''),
      'sizey': target.style.minHeight.replace(allButNumber, ''),
      'freq': target.style.freq,
    }
  }

  //configurar os valores do form -- valores-do-target || default
  document.getElementsByName('posx')[0].value = props.posx || event.clientX / window.innerWidth * 100;
  document.getElementsByName('posy')[0].value = props.posy || event.clientY / window.innerHeight * 100;
  document.getElementsByName('sizex')[0].value = props.sizex || 20;
  document.getElementsByName('sizey')[0].value = props.sizey || 20;
  document.getElementsByName('freq')[0].value = props.freq || 10;
  
  //consigo pegar ele como propriedade, e se for = new, entao criar novo target, caso contrario, editar o target
  targetDialog.targetID = id;
  
  targetDialog.showModal();
}

// fechar dialog
const handleTargetDialogSubmit = (e) => {
  if (e.submitter.name == 'confirm'){
    const formProps = Object.fromEntries(new FormData(e.target));
    if (targetDialog.targetID == 'new-target') createTarget(formProps);
    else editTarget(targetDialog.targetID, formProps);
  }
  targetDialog.close();
}


// TARGETS -----------------------------------------------------------------------------------------

// criar novo target
const createTarget = (props) =>{
  const target = document.createElement("span");
  target.id = window.ipc.uuid();
  target.isTarget = true;
  target.classList = 'target';
  document.body.append(target);
  editTarget(target.id, props);
}

// edita target existente
const editTarget = (id, props) => {
  const target = document.getElementById(id);
  target.style.minWidth = props.sizex + 'px';
  target.style.minHeight = props.sizey + 'px';  
  target.style.left = props.posx + 'vw';  
  target.style.top = props.posy + 'vh';
  target.style.animationDuration = `${1/props.freq}s`;
  target.freq = props.freq;
}

const delTarget = (id) => {
  const target = document.getElementById(id);
  target.remove();
}