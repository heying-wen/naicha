// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const TcbRouter = require('tcb-router');
const { isEmpty,random } = require('lodash')
const db = cloud.database() 
const orderCollection = db.collection('order')
const userCouponCollection = db.collection('user_coupon')
const couponCollection = db.collection('coupon')
const addressCollection = db.collection('address')
const goodsCollection = db.collection('goods') 
const userCollection = db.collection('user')
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({ event });
  const {OPENID} = cloud.getWXContext()

  app.use(async(ctx,next)=>{
    ctx.openid = OPENID
    const user  = await userCollection.where({
      openid: OPENID
    }).get().then(res=> res.data)
    ctx.userId = user.length > 0 ? user[0]._id : '' 
    await next()
  })

  app.router('count',async(ctx)=>{
    let status = parseInt(event.status)
    if(isNaN(status)){
      status = -1
    }
    const where ={
      userId :ctx.userId
    }
    if(status > -1){
      where.status = status
    }
    const  count = await orderCollection.where(where).count().then(res=>res.total)
    ctx.body = count 
  })

  app.router('add',async(ctx)=>{
    const addressId = event.addressId || ''
    const goods = event.goods || []
    const userCouponId = event.userCouponId || ''
    if(!addressId && goods.length === 0){
      ctx.body={
        success:0,
        message:'参数错误'
      }
      return
    }
    try{
      let address = await addressCollection.where({
        _id:addressId,
        openid:ctx.openid
      }).get().then(res=>res.data)
      if(isEmpty(address)){
        ctx.body={
          success:0,
          message:'地址为空'
        }
        return
      }
      const goodsIds = goods.map(item => item.goodsId)
      const buyGoods = await goodsCollection.where({
        goods_id: _.in(goodsIds)
      }).field({
        goods_id:true,
        goods_img:true,
        goods_name:true,
        goods_price:true,
        max_buy:true,
        stock:true,
        _id:false
      }).get().then(res=>res.data)
      var orderTotal = 0
      var orderGooods = []
      for( let i in goods){
        const item = goods[i]
        let row = buyGoods.filter(val => val.goods_id == item.goodsId)
        if(row.length === 0){
          ctx.body={
            success: 0,
            message:'ID为' + item.goodsId + '的商品不存在'
          }
          return
        }
        row = row[0]
        if(item.buyNumber > row.stock){
          ctx.body={
            success: 0,
            message:`[${row.goods_name}]的库存不足`
          }
          return
        }
        orderTotal += item.buyNumber * row.goods_price
        Reflect.deleteProperty(row,'stock')
        orderGooods.push({
          ...row,
          buyNumber : item.buyNumber
        })
      }
      var couponMoney = 0
      if(userCouponId){
        const now = db.serverDate()
        var usercoupon = await userCouponCollection.where({
          _id : userCouponId,
          userId : ctx.userId,
          expire:_.gt(now),
          isUse:false
        }).get().then(res=>res.data)
        if(isEmpty(usercoupon)){
          ctx.body={
            success:0,
            message:'优惠券不存在'
          }
          return
        }
        userCoupon = userCoupon[0]
        var coupon = await couponCollection.doc(userCoupon.couponId).get().then(res=>res.data)
        if(coupon.orderTotal > orderTotal){
          ctx.body={
            success:0,
            message:'满' +coupon.orderTotal + '可用'
          }
          return
        }
        couponMoney = coupon.money
      }
      address = address[0]
      //组装订单数据
      const orderTestStatus = random(0,2) //0 待支付 1 已支付 2 已发货
      const data ={
        userId:ctx.userId,
        consignee:address.name,
        phone:address.phone,
        address:address.region[0]+address.region[1]+address.region[2]+address.detail,
        orderTotal,
        couponMoney,
        actualPayment:orderTotal-couponMoney,
        status:orderTestStatus,
        createTime:db.serverDate(),
        goods:orderGooods
      }
      switch(orderTestStatus){
        case 1:data.payTime = db.serverDate();break;
        case 2:data.sendTime = db.serverDate();break; 
      }

      const result = await db.runTransaction(async transaction =>{
        const res = await transaction.collection('order').add({
          data 
        })
        if(res._id){
          //修改库存
          for(let i = 0; i < orderGooods.length ; i++){
            const r1 =await transaction.collection('goods').where({
              goods_id:orderGooods[i].goods_id
            }).update({
              data:{
                stock: _.inc(-1*orderGooods[i].buyNumber)
              }
            })
            //修改购物车数据
            const r2 = await transaction.collection('cart').where({
              goodsId: orderGooods[i].goods_id,
              _openid:ctx.openid
            }).remove()
            if(!r1.stats.updated || !r2.stats.removed){
              await transaction.rollback({
                success:0,
                message:'操作失败'
              })
              break
            }
          }
          if(userCouponId != '' && data.couponMoney > 0){
            const r3 = await transaction.collection('user_coupon').doc(userCouponId).update({
              isUse:true,
              orderId : res._id,
              useTime:db.serverDate()
            })
            if(!r3.stats.updated){
              await transaction.rollback({
                success:0,
                message:'操作失败'
              })
            }
          }
          return {
            success:1,
            message:'操作成功'
          }
        }else{
          return {
            success:0,
            message:'操作失败'
          }
        }
      })
      ctx.body= result
    }catch(err){
      console.log('add-err',err)
      ctx.body={
        success:0,
        message:'操作失败'
      }
    }
  })

  app.router('list',async (ctx)=>{
    let status = parseInt(event.status)
    if(isNaN(status)){
      status = -1
    }
    const start = parseInt(event.start || 0)
    let count = parseInt(event.count || 20)
    count = count > 20 ? 20 : count
    const where ={
      userId :ctx.userId
    }
    if(status > -1){
      where.status = status
    }
    const list = await orderCollection.where(where).orderBy('createTime','desc').skip(start).limit(count).get().then(res=>res.data)
    ctx.body = list
  })

  app.router('addCartAll',async(ctx)=>{
    const data = event.data || []
    if(!Array.isArray(data) || data.length === 0){
      return false
    }
    try{
      const result = await db.runTransaction(async transaction => {
        const res = []
        for(let k in data){
          const r = await transaction.collection('cart').add({
            data:{
              ...data[k],
              _openid:ctx.openid,
              createTime:db.serverDate()
            }
          })
          if(r._id){
            res.push(r.id)
          }
        }
        
        if(res.length != data.length){
          transaction.rollback(0)
        }else{
          return res.length
        }
      })
      ctx.body = result > 0
    }catch(err){
      console.log('err',err)
      ctx.body = false
    }
  })

  app.router('removeQuickCart',async(ctx)=>{
    try{
      const res = await db.collection('cart').where({
        isQuick:true,
        _openid:ctx.openid
      }).remove()
      console.log(res.stats.removed)
    }catch(err){
      console.log(err)
      ctx.body = false
      return
    }
    ctx.body = true
  })

  return app.serve()
}