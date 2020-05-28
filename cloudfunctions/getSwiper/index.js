// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')
cloud.init()
axios.defaults.baseURL = 'http://www.2yue.cc/index.php/'
axios.defaults.timeout = 8000
axios.defaults.headers.appKey ='f68bSYqte0m6EibwhARrzTcYDPoV0FobCi06uDfM3eF4QGQQKSywmd71ytM'
const db = cloud.database()
const swiperCollection = db.collection('swiper')

// 云函数入口函数
exports.main = async (event, context) => {
  //查询swiper数据库的数据
  let isfetch = false
  let res = await swiperCollection.get().then(res => res.data)
  if(res.length === 0){
    isfetch = true
  }else{
    const maxTime = new Date(res[0].createTime).getTime()
    if(Date.now()-maxTime > 3600*1000*24){
      isfetch = true
    }
  }
  if(isfetch){
    res = await axios.get('api/swiper').then(res => {
    res = res.data
    if(res.error_code === 0){
      return res.data
    }else{
      return []
    }
  })
  //第一次添加
    if(res.length > 0){
      for (let key in res){
        const data = {
          ...res[key],
          createTime: db.serverDate()
        }
        const row = await swiperCollection.where({
          id:res[key].id
        }).get().then(res=>res.data)
        if(row.length === 0){
          await swiperCollection.add({
            data
          })
        }else{
          await swiperCollection.where({
            id:res[key].id
          }).update({
            data  
          })
        }
      }
    }
  }
  return res
}