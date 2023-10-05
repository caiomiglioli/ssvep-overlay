const btn_create = document.getElementById('preset-create');
const btn_open = document.getElementById('preset-open');
const btn_device = document.getElementById('device-config');
const btn_help = document.getElementById('help');

btn_create.addEventListener('click', () => overlay.open('create'));
btn_open.addEventListener('click', () => overlay.open('read'));
btn_device.addEventListener('click', () => { console.log('Configure device... wip')});
btn_help.addEventListener('click', () => console.log('Help... wip'));