import { getConfig,isEmptyObject } from '../../utils/function'
import { Cart } from '../../model/Cart'
import { Coupon } from '../../model/Coupon'
import { Order } from '../../model/Order'
const AUTH_LOGIN_KEY = getConfig('app.auth_login_key')
const ADDRESS_STORE_NAME = getConfig('storage.selectAddress')
const cartModel = new Cart()
let userSelectCouponId = ''
let quickBuy = 0
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address:{},
    cart:[],
    coupon:[],
    userCoupon:[],
    couponMoney: 0 ,
    orderTotal:0,
    actualPayment:0,
    checkboxImg:{
      default:'/images/checkbox.png',
      checkbox:'/images/checkbox@selected.png'
    },
  },
  //获取优惠活动优惠券
  
  async checkAuth(){
    //判断是否登录
    const isLogin = wx.getStorageSync(AUTH_LOGIN_KEY)
    if(isLogin != 1){
      wx.switchTab({
        url: '/pages/home/home',
      })
      return
    }
    //判断是否选择地址
    const address = wx.getStorageSync(ADDRESS_STORE_NAME)
    if(isEmptyObject(address)){
      wx.showToast({
        title: '请选择地址',
        icon:'none',
        success: ()=>{
          wx.switchTab({
            url: '/pages/list/list',
          })
        }
      })
      return
    }
    //判断是否有商品
    const cart = await cartModel.getCart(0,quickBuy)  // 获取商品
    if(cart.length === 0){
      wx.showToast({
        title: '请选择商品',
        icon:'none',
        success: ()=>{
          wx.switchTab({
            url: '/pages/list/list',
          })
        }
      })
      return
    }
    let orderTotal = 0
    cart.forEach(item =>{
      orderTotal += item.buyNumber * parseFloat(item.goodsPrice)
    })
    this.setData({
      address,
      cart,
      orderTotal,
      actualPayment:orderTotal
    })
  },
  async getCoupon(){
    const coupon = await Coupon.getCoupon()
    let userCoupon = await Coupon.getUserCoupon()
    console.log(coupon,userCoupon)
    userCoupon = userCoupon.map(item => {
      item.seletced = false
      return item
    })
    
    this.setData({
      coupon,
      userCoupon
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    quickBuy = parseInt(options.quick || 0)
    this.checkAuth()
    this.getCoupon()
  },
  async editCart(e){
    wx.showLoading({
      title: '加载中',
      mask:true,
    })
    const goodsId = e.detail.goodsId
    const type = e.detail.type
    if(type === 1){
      await this.updateCart(goodsId)
    }else{
      await this.reduceCart(goodsId)
    }
    wx.hideLoading()
  },
  async updateCart(goodsId){
    let cartList = this.data.cart
    let index = this.data.cart.findIndex(item =>item.goodsId === goodsId)
    if(index === -1){
      wx.showToast({
        title: '参数错误',
        icon:'none'
      })
      return
    }
    const cart = cartList[index]
    const buyNumber =cart.buyNumber + 1
    const res = await cartModel.updateCartBuyNumber(goodsId,buyNumber)
    if(res){
      wx.showToast({
        title: '操作成功',
      })
      cartList[index].buyNumber = buyNumber
      console.log(cartList)
      this.setData({
        cart:cartList
      })
    }else{
      wx.showToast({
        title: '操作失败',
        icon:'none'
      })
    }
  },
  async reduceCart(goodsId){
    let cartList = this.data.cart
    let index = this.data.cart.findIndex(item =>item.goodsId === goodsId)
    if(index === -1){
      wx.showToast({
        title: '参数错误',
        icon:'none'
      })
      return
    }
    const cart = cartList[index]
    let res
    if(cart.buyNumber === 1){
      //删除商品信息
      res = await cartModel.removeCartByGoodsId(goodsId)
    }else{
      var buyNumber =cart.buyNumber - 1
      res = await cartModel.updateCartBuyNumber(goodsId,buyNumber)
    }
    if(res){
      wx.showToast({
        title: '操作成功',
      })
      if(cart.buyNumber === 1){
        cartList.splice(index,1)
        this.setData({
          cart:cartList,
        })
        if(cartList.length === 0){
          wx.showToast({
            title: '购物车为空',
            icon:'none',
            mask:true,
            success:()=>{
              wx.switchTab({
                url: '/pages/list/list',
              })
            }
          })
        }
      }else{
        cartList[index].buyNumber = buyNumber
        this.setData({
          cart:cartList
        })
      }
    }else{
      wx.showToast({
        title: '操作失败',
        icon:'none'
      })
    }
  },
  //优惠券
  chooseCoupon(e){
    console.log(e)
    const id = e.detail.key
    const selected = e.detail.checked
    let userCoupon = this.data.userCoupon
    const index = userCoupon.findIndex(item => item._id ===id)
    const selectCoupon = userCoupon[index]
    if(selectCoupon.coupon.orderTotal > 0 && this.data.orderTotal < selectCoupon.coupon.orderTotal){
      wx.showToast({
        title: '满' +selectCoupon.coupon.orderTotal+ '可使用',
        icon:'none',
        mask:true
      })
      return
    }
    userCoupon = userCoupon.map(item =>{
      if(selected){
        item.selected = false
      }
      if(item._id === id){
        item.selected = selected
      }
      return item
    })
    let actualPayment = 0,couponMoney =0
    if(selected){
      actualPayment = this.data.orderTotal - selectCoupon.coupon.money
      couponMoney = selectCoupon.coupon.money
      userSelectCouponId = selectCoupon._id
    }else{
      actualPayment = this.data.orderTotal
      userSelectCouponId = ''
    }
    console.log(actualPayment)
    this.setData({
      userCoupon,
      actualPayment,
      couponMoney
    })
  },
  async submitOrder(){
    if(isEmptyObject(this.data.address)){
      wx.showToast({
        title: '请选择收货地址',
        icon: 'none'
      })
      return
    }
    if(this.data.cart.length === 0){
      wx.showToast({
        title: '购物车为空',
        icon: 'none'
      })
      return
    }
    const goods = this.data.cart.map(item =>{
      return{
        goodsId : item.goodsId,
        buyNumber : item.buyNumber
      } 
    })
    wx.showLoading({
      title: '提交中',
      mask: true
    })
    const res = await Order.add({
      addressId :this.data.address._id,
      goods,
      userCouponId: this.data.userSelectCouponId
    })
    wx.hideLoading()
    if(res.success === 1){
      //调起支付
      // wx.requestPayment({
      //   nonceStr: 'nonceStr',
      //   package: 'package',
      //   paySign: 'paySign',
      //   timeStamp: 'timeStamp',
      // })
      wx.switchTab({
        url: '/pages/order/order',
      })
    }else{
      wx.showToast({
        title: res.message,
        icon: 'none'
      })
    }
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
  async onHide () {
    if(quickBuy == 1){
      await cartModel.removeQuickGoods()
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  async onUnload () {
    if(quickBuy == 1){
      await cartModel.removeQuickGoods()
    }
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