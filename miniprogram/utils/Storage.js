
class Storage {
  constructor(key,hasExpire = true){
    if(key == null){
      throw new Error('key不能为空')
    }
    this.key = key
    this.hasExpire = true
  }
  //设置
  /**
   * @description 设置缓存
   * @params data[any] 缓存数据
   * @params expriceTime[int] 缓存时间 单位是小时
   */
  setStorage (data,expireTime = 0){
    let result = data 
    if(this.hasExpire){
      expireTime = parseInt(expireTime)
      if(isNaN(expireTime) || expireTime < 0){
        expireTime = Date.now() + 24*3600*1000
      }else{
        expireTime = Date.now() + expireTime*3600*1000
      }
      result = {
        data,
        expireTime
      }  
    }
    wx.setStorageSync(this.key, result)
  }
  //获取
  getStorage(){
    let result = wx.getStorageSync(this.key)
    if(!result){
      return result
    }
    if(this.hasExpire){
      if(result.expireTime < Date.now()){
        result = ''
        this.removeStorage()
      }else{
        result = result.data
      }
    }
    return result
  }
  //移除
  removeStorage(){
    wx.removeStorageSync(this.key)
  }
  //清空全部
  static clearStorage(){
    wx.clearStorageSync()
  }
}

export{
  Storage
}