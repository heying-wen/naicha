// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const TcbRouter = require('tcb-router');
const db = cloud.database()
const goodsCollection = db.collection('goods')
const categoryCollection = db.collection('category')
// 云函数入口函数
exports.main = async (event, context) => {
  const number = event.number || 20
  const app = new TcbRouter({ event });
  app.router('recommend', async (ctx) => {
    const list = await goodsCollection.where({
      is_recommend:1
    }).field({
      goods_id:true,
      goods_img:true,
      goods_name:true,
      goods_price:true,
      max_buy:true,
      stock:true,
    }).orderBy('goods_id','desc').limit(number).get().then(res=>res.data)
    ctx.body = list
  });
  app.router('recommend', async (ctx) => {
    ctx.body = {
      data:'新品商品'
    }
  });

  //获取商品分类
  app.router('category', async (ctx) =>{
    const parentId = parseInt(event.parentId || 0)
    const res= await categoryCollection.where({
      parent_id:parentId
    }).field({
      _id:false,
      cat_id:true,
      cat_name:true
    }).get().then(res=>res.data)
    ctx.body = res
  })


  //分页获取数据
  app.router('list',async(ctx)=>{
    const where = {}
    const number = event.number || 10
    const offset = event.offset || 0
    const isRecommend = event.isRecommend || 0
    const isSales = event.isSales || 0
    const pid = event.pid || 0
    if(isRecommend ==1){
      where.is_recommend = 1
    }
    if(isSales ==1){
      where.is_sales = 1
    }
    if(pid > 0){
      where.pcat_id = pid
    }
    const list = await goodsCollection.where(where).field({
      goods_id:true,
      goods_img:true,
      goods_name:true,
      goods_price:true,
      max_buy:true,
      stock:true,
    }).orderBy('goods_id','desc').skip(offset).limit(number).get().then(res=>res.data)
    ctx.body = list
  })
  return app.serve()
}