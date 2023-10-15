//buttons
const btn_run = document.getElementById('run');
const btn_new = document.getElementById('new');
const btn_edit = document.getElementById('edit');
const btn_del = document.getElementById('delete');
const btn_save = document.getElementById('save');

const toggleEditMode = (toggle) => window.ipc.send('toggle-overlay-editmode', toggle);

// button functions
btn_run.addEventListener('click', (event) => {
  toggleEditMode(false)
  window.ipc.send('menu-to-targets', {'cmd': 'run'});
});

btn_new.addEventListener('click', (event) => {
  toggleEditMode(true)
  window.ipc.send('menu-to-targets', {'cmd': 'new-target'});
});

btn_edit.addEventListener('click', (event) => {
  toggleEditMode(true)
  window.ipc.send('menu-to-targets', {'cmd': 'edit-target'});
});

btn_del.addEventListener('click', (event) => {
  toggleEditMode(true)
  window.ipc.send('menu-to-targets', {'cmd': 'del-target'});
});
