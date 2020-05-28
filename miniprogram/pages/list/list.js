import { Cart } from '../../model/Cart'
const cartModel = new Cart()
const MAX_FETCH_NUM = 6
let catId = -1
let promotion = [{cat_id : -1,cat_name:"热销"},{cat_id : -2,cat_name:"优惠"}]
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address:{
      name:'张三',
      phone:'13545123123',
      detail:'湖南长沙'
    },
    catetory:[],
    goods:[],
    bodyHeight:0,
    rightTitle:'',
    hasMore:true,
    cart:[],
  },
  // async getCategory (){   获取信息
  //   const db = wx.cloud.database()
  //   const res= await db.collection('category').where({
  //     parent_id:0
  //   }).get().then(res=>res.data)
  //   console.log(res)
  // },
  async getCategory(){
    let category = await wx.cloud.callFunction({
      name:'goods',
      data:{
        $url:'category'
      }
    }).then(res=>res.result)
    category = promotion.concat(category)
    this.setData({
      category
    })
  },
  async getGoodsList(){
    if(!this.data.hasMore){
      wx.showToast({
        title: '亲，已经到底了~',
        icon:'none'
      })
      return
    }
    const data = {
      $url:'list',
      number:MAX_FETCH_NUM,
      offset:this.data.goods.length
    }
    if(catId === -1){
      data.isRecommend = 1
    }else if(catId === -2){
      data.isSales = 1 
    }else if(catId > 0){
      data.pid = catId
    }
    const list = await wx.cloud.callFunction({
      name:'goods',
      data
    }).then(res=>res.result)
    if(list.length > 0){
      let goods = this.data.goods.concat(list)
      this.setData({
        goods
      })
      this.reformGoods()
    }else{
      wx.showToast({
        title: '亲，已经到底了~',
        icon:'none'
      })
      this.setData({
        hasMore:false
      })
    }
  },
  async reformGoods(){
    const cart = await cartModel.getCart()
    let goods = this.data.goods.map(item =>{
      item.buyNumber = 0
      //根据购物车的数据处理buyNumber
      const tmp = cart.filter(val => val.goodsId === item.goods_id)
      if(tmp.length > 0){
        item.buyNumber = tmp[0].buyNumber
      }
      return item
    })
    this.setData({
      goods,
      cart
    })
  },
  loadMore(){
    this.getGoodsList()
  },
  async editCart(e){
    wx.showLoading({
      title: '加载中',
      mask:true,
    })
    const goodsId = e.detail.goodsId
    const type = e.detail.type
    if(type === 1){
      await this.addCart(goodsId)
    }else{
      await this.reduceCart(goodsId)
    }
    wx.hideLoading()
  },
  async addCart(goodsId){
    let goods = this.data.goods.filter(item =>item.goods_id === goodsId)
    if(goods.length === 0){
      wx.showToast({
        title: '参数错误',
        icon:'none'
      })
      return
    }
    goods = goods[0]
    const cart = await cartModel.getCart(goodsId)
    let res = null
    if(cart.length === 0){
      const data = {
        goodsId : goods.goods_id,
        goodsName : goods.goods_name,
        goodsImg : goods.goods_img,
        goodsPrice : goods.goods_price,
        buyNumber : 1
      }
      res= await cartModel.setCart(data)
    }else{
      const buyNumber =cart[0].buyNumber + 1
      res = await cartModel.updateCartBuyNumber(goodsId,buyNumber)
    }
    if(res){
      wx.showToast({
        title: '操作成功',
      })
      this.reformGoods()
    }else{
      wx.showToast({
        title: '操作失败',
        icon:'none'
      })
    }
  },
  async reduceCart(goodsId){
    let goods = this.data.goods.filter(item =>item.goods_id === goodsId)
    if(goods.length === 0){
      wx.showToast({
        title: '参数错误',
        icon:'none'
      })
      return
    }
    goods = goods[0]
    const cart = await cartModel.getCart(goodsId)
    if(cart.length === 0){
      wx.showToast({
        title: '操作失败',
        icon:'none'
      })
      return
    }
    let res
    if(cart[0].buyNumber ===1){
      //删除商品信息
      res = await cartModel.removeCartByGoodsId(goodsId)
    }else{
      const buyNumber =cart[0].buyNumber - 1
      res = await cartModel.updateCartBuyNumber(goodsId,buyNumber)
    }
    if(res){
      wx.showToast({
        title: '操作成功',
      })
      this.reformGoods()
    }else{
      wx.showToast({
        title: '操作失败',
        icon:'none'
      })
    }
  },
  changeCategory (e){
    catId = e.detail.catId
    const index = this.data.category.findIndex(item => item.cat_id === catId)
    const rightTitle = this.data.category[index].cat_name || ''
    this.setData({
      rightTitle,
      goods:[],
      hasMore:true
    })
    this.getGoodsList()
  },
  async initData(){
    await this.getCategory()
    await this.getGoodsList()
    const index = this.data.category.findIndex(item => item.cat_id === catId)
    const rightTitle = this.data.category[index].cat_name || ''
    this.setData({
      rightTitle
    })
    wx.getSystemInfo({ //res.windowHeight
      success: res => {
        const query = wx.createSelectorQuery()
        query.select('#address').boundingClientRect(rest =>{
          this.setData({
            bodyHeight : res.windowHeight - rest.height
          })
        }).exec()
      },
    })
  },
  cartSubmit(){
    //判断是否登录
    //判断是否选择地址
    //判断购物车是否为空
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initData()
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