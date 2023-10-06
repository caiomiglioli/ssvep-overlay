//buttons
const btn = document.getElementById('teste');

btn.addEventListener('click', ()=>{
  console.log('click do teste')
  window.ipc.send('menu-to-targets', 'mandando conteudo pro overlay')
});