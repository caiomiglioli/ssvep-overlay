const getData = async () => {
  const ssvepConfig = await window.g.getTargetsFile()
  
  console.log(ssvepConfig)

  const showdata = document.getElementById('show-data');
  showdata.innerText = JSON.stringify(ssvepConfig)
}

getData()