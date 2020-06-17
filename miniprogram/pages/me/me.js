import {User} from '../../model/User'
import {dateFormat} from '../../utils/function'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{}
  },
  async getUser(){
    // const user = await User.getDetailHttp()
    const user = await User.getDetail()
    this.setData({
      userInfo: user
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getUser()
  },
  changeAvatar(){
    wx.chooseImage({
      count:1,
      success: res=> {
        console.log(res)
        const avatarTmpPath = res.tempFilePaths[0]
        // this.updateAvatarHttp(avatarTmpPath)
        this.updateAvatarCloud(avatarTmpPath)
      }
    })
  },
  //接口上传头像
  updateAvatarHttp(avatarTmpPath){ 
    wx.showLoading({
      title: '正在上传',
      mask:true
    })
    User.uploadAvatar(avatarTmpPath).then(res=>{
      console.log(res)
      // this.setData({
      //   'userInfo.avatarUrl':res.src
      // })
    }).catch(err=>{
      console.error(err)
      wx.showToast({
        title: '上传失败',
        icon:'none'
      })
    }).finally(()=>{
      wx.hideLoading()
    })
  },
  //云端上传头像
  updateAvatarCloud(avatarTmpPath){
    //上传图片到云存储
    wx.showLoading({
      title: '正在上传请稍后',
      mask:true
    })
    const cloudPath = "user-avatar/" + dateFormat('YYYY-mm-dd',new Date())+'/'  + Date.now()+ avatarTmpPath.substr(avatarTmpPath.lastIndexOf('.'))
    wx.cloud.uploadFile({
      cloudPath,
      filePath:avatarTmpPath
    }).then(res =>{
      if(res.fileID){
        //修改头像
        const avatarUrl = res.fileID
        User.update(this.data.userInfo._id,{avatarUrl}).then(res=>{
          console.log(res) 
          if(res.success === 1){
            this.setData({
              'userInfo.avatarUrl':avatarUrl
            })
          }else{
            wx.showToast({
              title: res.message,
              icon:'none'
            })
          }
        }).finally(()=>{
          wx.hideLoading()
        })
      }
    })
  },
  jumpMenu(e){
    const url = e.currentTarget.dataset.url
    wx.navigateTo({
      url
    })
  },
  async createQrcode(){
    const data ={
      scene:'1,2,3'
    }
    const qrcode = wx.getStorageSync('qrcode')
    if(qrcode && qrcode.scene === data.scene){
      wx.previewImage({
        urls: [qrcode.img.imgUrl],
      })
      return
    }
    const res = await User.getQrcode(data)
    if(res.success === 1){
      wx.previewImage({
        urls: [res.data.imgUrl],
      })
      wx.setStorageSync('qrcode',{
        img:res.data,
        scene:data.scene
      })
    }else{
      wx.showToast({
        title: res.message,
        icon:'none'
      })
    }
  },
  
})