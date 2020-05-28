//getConfig(navitage.a)
const getConfig = function (name){
  const distIndex = name.indexOf('.')
  let fileName = '',configName = ''
  if(distIndex > -1){
    fileName = name.slice(0,distIndex)
    configName = name.substr(distIndex+1)
  }else{
    fileName = name
  }
  try{
    const config = require('../config/'+ fileName).default
    if(config){
      return configName !== '' ? config[configName] : config
    }else{
      return null
    }
  } catch (err) {
    console.log(err)
    return null
  }
}
export {
  getConfig
}