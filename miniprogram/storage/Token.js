import {
  Storage
}from '../utils/Storage'
import{
  getConfig
}from '../utils/function'
const tokenKey = getConfig('storage.token') || 'token'
class Token extends Storage {
  constructor (){
    super(tokenKey,true)
  }
}
export{
  Token
}