// components/login/index.js

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isLogin:Number
  },
  observers:{
    isLogin(val){
      let showLogin
      if(val === 0){
        wx.hideTabBar()
        showLogin = true
      }else{
        wx.showTabBar()
        showLogin = false
      }
      this.setData({
        showLogin
      })
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    showLogin:false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getUserInfo(e){
      if(e.detail.userInfo){
        //允许授权
        getApp().autoLogin()
      }else{
        //拒绝授权，关闭小程序
      }
    }
  }
})
