// miniprogram/pages/home/home.js
import {
  getConfig
} from '../../utils/function'
// import { Swiper } from '../../model/Swiper'
import {
  Banner
} from '../../storage/Banner'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    recommendList:[],
    navigate: [],
    bannerList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initData()
  },
  //初始化
  async initData() {
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    
    const navigate = await this.getNavigate()
    const bannerList = await this.getBannerList()
    const recommendList = await this.getRecommend()
    wx.hideLoading()
    this.setData({
      navigate,
      bannerList,
      recommendList
    })
  },
  async getRecommend(){
    return await wx.cloud.callFunction({
      name:'goods',
      data:{
        $url:'recommend',
        number:5
      }
    }).then(res => res.result)
  },
  getNavigate() {
    return getConfig('navigate') || []
  },
  async getBannerList() {
    //判断是否有缓存
    const bannerStorage = new Banner()
    let bannerList = bannerStorage.getStorage()
    if(!bannerList){
      bannerList = await wx.cloud.callFunction({
        name: 'getSwiper'
      }).then(res => res.result.map(item => item.img))
      //保存缓存
      bannerStorage.setStorage(bannerList,2)
    }
    return bannerList
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})