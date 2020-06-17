//app.js
import { getConfig} from './utils/function'
import { Login } from './model/Login'
import { Token } from './storage/Token'
const tokenStorage = new Token()
const AUTH_LOGIN_KEY = getConfig('app.auth_login_key')
App({
  //生命周期函数，进入小程序的时候运行一次
  onLaunch: function () {
    //检测版本更新
    this.updateCode()
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'naicha-6lo30',
        traceUser: true,
      })
    }

    //处理登录
    // wx.login({
    //   success: res => {
    //     console.log(res)
    //   },
    // })
    wx.getSetting({
      success:res =>{
        if(res.authSetting['scope.userInfo']){
          //已经授权,登录
          // this.autoLogin() //云端登录
          const token = tokenStorage.getStorage() //接口登录
          if(!token){
            this.httpLogin()
          }
        }else{
          wx.setStorageSync(AUTH_LOGIN_KEY, 0)
        }
      }
    })

    this.globalData = {}
  },
  autoLogin(callback){  //云端登录
    wx.cloud.callFunction({
      name:'login'
    }).then(res=>{
      res = res.result
      if(res.success === 1){
        wx.setStorageSync(AUTH_LOGIN_KEY, 1),
        // wx.showTabBar(),
        wx.setStorageSync('openid', res.openid)
        callback && callback()
      }else{
        wx.setStorageSync(AUTH_LOGIN_KEY, 0)
      }
    })
  },
  httpLogin(callback){ //接口登录
    wx.login({
      success: res => {
        console.log(res)
        if(res.code){
          Login.getToken(res.code).then(res=>{
            console.log(res)
            if(res.token){
              wx.setStorageSync(AUTH_LOGIN_KEY, 1)
              tokenStorage.setStorage(res.token , 2)
              wx.showTabBar()
              callback && callback()
            }
          })
        }
      },
    })
  },
  updateCode(){
    if(wx.canIUse('getUpdateManager')){
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(res => {
        console.log(res.hasUpdate)
        if(res.hasUpdate){
          updateManager.onUpdateReady(()=>{
            wx.showModal({
              title: '更新提示',
              content:'版本已经更新，是否重启应用',
              success:res=>{
                if(res.confirm){
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(()=>{
            wx.showModal({
              title: '新版本提醒',
              content:'新版本已经上线，请删除小程序重新搜索打开',
            })
          })
        }
      })
    }
  }
})
