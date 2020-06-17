import { Http } from "../utils/Http"
import {getConfig} from "../utils/function"
const {appId,appSecret} = getConfig('app')
class Login{
  static getToken(code){
    // console.log(code,appId,appSecret)
    return Http.requset({
      url:"api/token/user",
      method: 'POST',
      data:{
        code,
        appId,
        appSecret
      }
    }).then(res=>{
      return Promise.resolve(res)
    }).catch(err=>{
      wx.showToast({
        title:err,
        icon:"none"
      })
    })
  }
}

export{
  Login
}