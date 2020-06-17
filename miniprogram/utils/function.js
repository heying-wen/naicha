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

//不是数组
const isObject = function (obj){
  return typeof(obj) == 'object' && obj !=null
}
 
//是否为空
const isEmptyObject =function (obj){
  if(!isObject(obj)){
    return !obj
  }
  return Object.keys(obj).length === 0
}

//年月日
function dateFormat(fmt, date) {
  let ret;
  const opt = {
    "Y+": date.getFullYear().toString(),        // 年
    "m+": (date.getMonth() + 1).toString(),     // 月
    "d+": date.getDate().toString(),            // 日
    "H+": date.getHours().toString(),           // 时
    "M+": date.getMinutes().toString(),         // 分
    "S+": date.getSeconds().toString()          // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  };
  for (let k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt);
    if (ret) {
      fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
    };
  };
  return fmt;
}

export {
  getConfig,
  isObject,
  isEmptyObject,
  dateFormat
}