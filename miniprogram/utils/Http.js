 import { getConfig } from "./function"
const httpConfig = getConfig('http')
 class Http {
   static requset({url,data={},method="GET",header = {}}){
    if(!url.startsWith('http://')&&!url.startsWith('https://')){
      url = httpConfig.baseUrl + url
    }
    if(!Reflect.has(header,'appkey') && httpConfig.apiKey){
      header.appKey = httpConfig.apiKey
    }
    return new Promise ((resolve,reject) => {
      wx.request({
        url,
        data,
        method,
        header,
        success:res =>{
          if(res.statusCode.toString().startsWith('2')){
            res = res.data
            if( parseInt(res.error_code) === 0){
              resolve(res.data || '')
            }else{
              reject(res.error_msg)
            }
            
          }else{
            reject('请求失败')
          }
        },
        fail:err =>{
          reject(err)
        }
      })
    })
  }
  static upload({file,url,name,header={},forData}={}){
    if(!url.startsWith('http://')&&!url.startsWith('https://')){
      url = httpConfig.baseUrl + url
    }
    
    if(!Reflect.has(header,'appkey') && httpConfig.apiKey){
      header.appKey = httpConfig.apiKey
    }
    return new Promise ((resolve,reject) => {
      wx.uploadFile({
        filePath: file,
        name,
        url,
        header,
        forData,
        success:res =>{
          if(res.statusCode.toString().startsWith('2')){
            res = JSON.parse(res.data)
            if( parseInt(res.error_code) === 0){
              resolve(res.data || '')
            }else{
              reject(res.error_msg)
            }
            
          }else{
            reject('上传失败')
          }
        },
        fail:err =>{
          reject(err)
        }
      })
    })
  }
}

export{
  Http
}