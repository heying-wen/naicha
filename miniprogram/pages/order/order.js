import {getConfig,isEmptyObject} from '../../utils/function'
import { Order } from '../../model/Order'
import {Address} from '../../model/Address'
import { Cart } from '../../model/Cart'
const cartModel  = new Cart()

const orderTaBar = getConfig('order.orderTaBar') || []
const ADDRESS_STORE_NAME = getConfig('storage.selectAddress')
const ORDER_NUM_MAX = 10
let orderCount = 0
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderTaBar,
    orderStatusDefault:-1,
    order:[],
    hasMore:true,
    hasOrder:false
  },
  async getOrder(){
    if(!this.data.hasMore){
      wx.showToast({
        title: '已经到底了~',
        icon:"none"
      })
      return
    }
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    const list = await Order.page(this.data.orderStatusDefault,this.data.order.length,ORDER_NUM_MAX)
    wx.hideLoading()
    if(list.length === 0){
      this.setData({
        hasMore:false
      })
      return
    }
    const order = this.data.order.concat(list)
    console.log(order)
    this.setData({
      order,
      hasMore:orderCount>ORDER_NUM_MAX
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    orderCount = await Order.count()
    this.setData({
      hasOrder:orderCount > 0
    })
    this.getOrder()
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
  async orderTaber(e){
    const orderStatusDefault = parseInt(e.detail.activeKey)
    this.setData({
      orderStatusDefault,
      order:[],
      hasMore:true
    })
    orderCount = await Order.count(orderStatusDefault)
    this.getOrder()
  },
  //再来一单
  async quickBuy(e){
    const orderId = e.currentTarget.dataset.orderId
    if(!orderId){
      return
    }
    let order = this.data.order.filter(item => item._id === orderId)
    if(order.length === 0){
      return
    }
    order = order[0]
    let address = wx.getStorageSync(ADDRESS_STORE_NAME)
    if(isEmptyObject(address)){
      //获取默认地址
      address = await Address.getDefaultOrSelectAddress()
      wx.setStorageSync(ADDRESS_STORE_NAME, address)
    }
    const data = []
    order.goods.forEach(item =>{
      data.push({
        goodsId: item.goods_id,
        goodsImg:item.goods_img,
        goodsName:item.goods_name,
        goodsPrice:item.goods_price,
        buyNumber:item.buyNumber,
        isQuick:true
      })
    })
    const res = await cartModel.setCartAll(data)
    if(res){
      wx.navigateTo({
        url: '/pages/settlement/settlement?quick=1',
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