import {Http} from '../utils/Http'
import {Token} from '../storage/Token'
const tokenStorage = new Token()
class User{
  //云端
  static async getDetail(){
    let user = await wx.cloud.callFunction({
      name:'user',
      data:{
        $url:'detail'
      }
    }).then(res=>res.result)
    if(!user.nickname){
      return new Promise((resolve,reject)=>{
        wx.getUserInfo({
          success: res => {
            if(res.userInfo){
              user = {...res.userInfo,...user}
              resolve(user)
            }
          },
        })
      })
    }
    return user
  }
  //接口
  static async getDetailHttp (){
    const token = tokenStorage.getStorage()
    let user = await Http.requset({
      url:'api/user',
      header:{
        token
      }
    })
    if(!user.nickname){
      return new Promise((resolve,reject)=>{
        wx.getUserInfo({
          success: res => {
            if(res.userInfo){
              user = {...res.userInfo,...user}
              resolve(user)
            }
          },
        })
      })
    }
    return user
  }

  static async update(userId,data){
    return await wx.cloud.callFunction({
      name:'user',
      data:{
        $url:'update',
        user:data,
        userId
      }
    }).then(res=>res.result)
  }

  static async getQrcode(data){
    return await wx.cloud.callFunction({
      name:'user',
      data:{
        $url:'qrcode',
        ...data
      }
    }).then(res => res.result)
  }

  static async uploadAvatar (file){
    const token = tokenStorage.getStorage()
    return Http.upload({
      file,
      name:'image',
      url:'api/user/avatar',
      header:{
        token
      }
    })
  }
}

export {
  User
}