import 'babel-polyfill'
import reqp from 'request-promise'
import NodeCache from 'node-cache'
import wechatSign from './helpers/wechatSign'
import replaceTpl from './helpers/replaceTpl'
import localConfig from '../config/wechat.json'

export default class Wechat {
  constructor(config = {}) {
    this.tokenApiTemplate = config.tokenApiTemplate || localConfig.tokenApiTemplate
    this.ticketApiTemplate = config.ticketApiTemplate || localConfig.ticketApiTemplate
    this.templateVariablePattern = config.templateVariablePattern
    this.tokenApi = replaceTpl({
      template: this.tokenApiTemplate,
      data: config,
      pattern: this.templateVariablePattern,
    })
    this.ticketApi = null
    this.cacheExpiresInSeconds = config.cacheExpiresInSeconds || 7200
    this.cache = new NodeCache()
  }

  async getAccessToken(refresh = false) {
    let access_token = this.cache.get('accessToken')
    if (refresh || !access_token) {
      const opts = { uri: this.tokenApi, json: true }
      const data = await reqp(opts)
      if (data.errcode) throw('wechat sever response error')
      access_token = data.access_token
      const tokenExpiresInSeconds = this.cacheExpiresInSeconds
        || data.expires_in
      this.cache.set('accessToken', access_token, tokenExpiresInSeconds)
    }
    const expires_in_ms = this.cache.getTtl('accessToken') - new Date()
    const expires_in = expires_in_ms / 1000
    const token = { access_token, expires_in }
    return token
  }

  async getTicket(refresh = false) {
    let ticket = this.cache.get('jsapiTicket')
    if (refresh || !ticket) {
      const token = await this.getAccessToken()
      this.ticketApi = replaceTpl({
        template: this.ticketApiTemplate,
        data: { access_token: token.access_token },
        pattern: this.templateVariablePattern,
      })
      const opts = { uri: this.ticketApi, json: true }
      const data = await reqp(opts)
      if (data.errcode) throw('wechat sever response error')
      ticket = data.ticket
      const ticketExpiresInSeconds = token.expires_in
      this.cache.set('jsapiTicket', ticket, ticketExpiresInSeconds)
    }
    const expires_in_ms = this.cache.getTtl('jsapiTicket') - new Date()
    const expires_in = expires_in_ms / 1000
    const jsapi_ticket = { ticket, expires_in }
    return jsapi_ticket
  }

  async sign(url) {
    const jsapi_ticket = await this.getTicket()
    const ticket = jsapi_ticket.ticket
    return wechatSign(ticket, url)
  }
}
