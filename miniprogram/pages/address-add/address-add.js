// miniprogram/pages/address-add/address-add.js
import { Address } from '../../model/Address'
import {getConfig,isEmptyObject} from '../../utils/function'
const ADDRESS_STORE_NAME = getConfig('storage.selectAddress')
let redirectType =''
let addressId = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    region: [],
    customItem: '全部',
    address:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    redirectType = options.from || ''
    addressId = options.id || ''
    this.getAddress()
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
  getAddress(){
    if(!addressId){
      return
    }
    Address.getAddressById(addressId).then(res=>{
      console.log(res)
      if(!isEmptyObject(res)){
        this.setData({
          address:res,
          region:res.region
        })
      }
    })
  },
  bindRegionChange: function (e) {
    this.setData({
      region: e.detail.value,
    })
  },
  async saveAddress(e){
    const data = e.detail.value
    data.region = this.data.region
    wx.showLoading({
      title: '正在提交数据',
      mask: true
    })
    let res
    if(addressId != ''){
      res = await Address.update(data,addressId)
    }else{
      res = await Address.add(data)
    }
    wx.hideLoading()
    console.log(res)
    if(res.success == 1){
      wx.showToast({
        title: addressId != ''?'修改成功':'添加成功',
      })
      console.log(redirectType,addressId)
      if(redirectType === 'list' && addressId === ''){
        data._id = res.addressId
        wx.setStorageSync(ADDRESS_STORE_NAME, data)
        wx.switchTab({
          url: '/pages/list/list',
        })
      }else{
        wx.redirectTo({
          url: '/pages/address/address?from=' + redirectType,
        })
      }
    }else{
      wx.showToast({
        title: res.message,
        icon:'none'
      })
    }
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