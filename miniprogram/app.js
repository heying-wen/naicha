//app.js
import { getConfig} from './utils/function'
const AUTH_LOGIN_KEY = getConfig('app.auth_login_key')
App({
  onLaunch: function () {
    
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
          this.autoLogin()
        }else{
          wx.setStorageSync(AUTH_LOGIN_KEY, 0)
        }
      }
    })

    this.globalData = {}
  },
  autoLogin(){
    wx.cloud.callFunction({
      name:'login'
    }).then(res=>{
      res = res.result
      if(res.success === 1){
        wx.setStorageSync(AUTH_LOGIN_KEY, 1),
        wx.showTabBar(),
        wx.setStorageSync('openid', res.openid)
      }else{
        wx.setStorageSync(AUTH_LOGIN_KEY, 0)
      }
    })
  }
})
