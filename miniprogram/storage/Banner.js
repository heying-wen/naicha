import {
  Storage
}from '../utils/Storage'
import{
  getConfig
}from '../utils/function'
const bannerKey = getConfig('storage.banner') || 'banner'
class Banner extends Storage {
  constructor (){
    super(bannerKey,true)
  }
}
export{
  Banner
}