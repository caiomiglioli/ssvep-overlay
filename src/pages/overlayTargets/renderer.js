const getData = async () => {
  const ssvepConfig = await window.ipc.getTargetsFile()
  
  console.log(ssvepConfig)

  const showdata = document.getElementById('show-data');
  showdata.innerText = JSON.stringify(ssvepConfig)
}

getData()

ipc.on('menu-to-targets', (event, message) => {
  console.log(message)
  const debug = document.getElementById('debug');
  debug.innerText = debug.innerText + message
})