// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const TcbRouter = require('tcb-router');
const db = cloud.database()
const userCollection = db.collection('user')
const { isEmpty } = require('lodash')
const {dateFormat} = require('./function.js')
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
  app.router('detail',async(ctx) =>{
    const user = await userCollection.doc(ctx.userId).get().then(res =>res.data)
    ctx.body = user
  })

  //修改
  app.router('update',async(ctx)=>{
    const user = event.user
    const userId = event.userId
    if(isEmpty(user)||!userId){
      ctx.body ={
        success:0,
        message:'参数错误'
      }
      return
    }
    try{
      const userInfo = await userCollection.doc(ctx.userId).get().then(res =>res.data)
      if(isEmpty(userInfo)){
        throw new Error('用户不存在')
      }
      const res = await userCollection.doc(ctx.userId).update({
        data:user
      })
      if(res.stats.updated > 0){
        if(user.avatarUrl && userInfo.avatarUrl){
          await cloud.deleteFile({
            fileList: [userInfo.avatarUrl],
          })
        }
      }else{
        throw new Error('没有修改数据')
      }
      
    }catch(err){
      console.log('update-err',err)
      ctx.body ={
        success:0,
        message:'修改失败'
      }
      return
    }
    ctx.body ={
      success:1,
      message:'修改成功'
    }

  })

  app.router('qrcode',async(ctx)=>{
    const scene = event.scene || ''
    const page = event.page || ''
    try {
      const result = await cloud.openapi.wxacode.getUnlimited({
        page,
        scene,
        lineColor:{"r":255,"g":206,"b":0}
      })
      if(result.errCode !==0){
        ctx.body = {
          success:0,
          message:result.errMsg
        }
        return
      }
      const date = new Date()
      const res = await cloud.uploadFile({
        cloudPath:'qrcode/' + dateFormat('YYYY-mm-dd',date) + '/' + date.getTime() + '.png',
        fileContent:result.buffer
      })
      if(res.errCode != null && res.errCode !== 0 ){
        ctx.body = {
          success:0,
          message:res.errMsg
        }
        return
      }
      let fileList = await cloud.getTempFileURL({
        fileList:[{
          fileID:res.fileID,
          maxAge:3600*24*30
        }]
      }).then(res=>res.fileList)
      fileList = fileList[0]
      if(fileList.status !== 0){
        ctx.body = {
          success:0,
          message:fileList.errMsg
        }
        return
      }
      ctx.body={
        success:1,
        data:{
          fileID:res.fileID,
          imgUrl:fileList.tempFileURL
        }
      }
    } catch (err) {
      console.log('qrcode-err',err)
      ctx.body = {
        success:0,
        message:'生成失败'
      }
    }
  })

  return app.serve()
}