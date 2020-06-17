// miniprogram/pages/address/address.js
import { getConfig,isEmptyObject } from '../../utils/function'
import { Address } from '../../model/Address'
const ADDRESS_STORE_NAME = getConfig('storage.selectAddress')
let redirectType =''
const MAX_ADDRESS_NUM = 5
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showAddBtn:true,
    address:[],
    slideButtons:[{text:'修改'},{text:'删除',type: 'warn',}]
  },
  async getAddressList(){
    let address = await Address.getAddress()
    if(redirectType === 'list'){
      const storageAddress = wx.getStorageSync(ADDRESS_STORE_NAME)
      address = address.map(item=>{
        item.selected = false
        if(!isEmptyObject(storageAddress)&&storageAddress._id === item._id){
          item.selected = true
        }
        return item
      })
    }
    
    const showAddBtn = address.length < MAX_ADDRESS_NUM
    this.setData({
      address
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    redirectType = options.from || ''
    const navigationBarTitle = redirectType === 'list'?'选择地址':'我的地址' 
    wx.setNavigationBarTitle({
      title: navigationBarTitle,
    })
    this.getAddressList()
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
  toAddAddress(){
    wx.navigateTo({
      url: '/pages/address-add/address-add?from=' + redirectType + '&from=' + redirectType,
    })
  },
  slideButtonTap(e) {  //地址删除、修改
    const type = e.detail.index
    const id = e.currentTarget.dataset.id
    if(type === 0){ //修改地址
      wx.navigateTo({
        url: '/pages/address-add/address-add?id=' + id + '&from=' + redirectType,
      })
    }else{ //删除地址
      this.deleteAddress(id)
    }
  },
  deleteAddress(id){
    if(!id){
      return
    }
    wx.showModal({
      title: '确定要删除吗？',
      success: res=>{
        if(res.confirm){
          wx.showLoading({
            title: '删除中',
            mask:true
          })
          Address.deleteAddress(id).then(res=>{
            if(res.success == 1){
              wx.showToast({
                title: '删除成功',
              })
              let address = this.data.address
              const index = address.findIndex(item => item._id === id)
              if(index > -1){
                address.splice(index, 1)
                this.setData({
                  address
                })
                const storageAddress = wx.getStorageSync(ADDRESS_STORE_NAME)
                if(storageAddress && storageAddress._id == id ){
                  wx.removeStorageSync(ADDRESS_STORE_NAME)
                }
              }
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
      }
    })
  },
  chooseAddress(e){
    if(redirectType !== 'list'){
      return
    }
    const id = e.currentTarget.dataset.id
    const addressList = this.data.address
    if(!id || addressList.length === 0){
      return
    }
    const address = addressList.filter(item => item._id === id)
    if(address.length === 0){
      return
    }
    wx.setStorageSync(ADDRESS_STORE_NAME, address[0])
    wx.switchTab({
      url: '/pages/list/list',
    })
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