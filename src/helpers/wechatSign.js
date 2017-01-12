import JsSHA from 'jssha'

const createNonceStr = () => {
  return Math.random().toString(36).substr(2, 15)
}

const createTimestamp = () => {
  const timestamp = parseInt(new Date().getTime() / 1000, 10)
  return String(timestamp)
}

const raw = (args) => {
  const keys = Object.keys(args).sort()
  const newArgs = {}
  keys.forEach((key) => {
    newArgs[key.toLowerCase()] = args[key]
  })

  let string = ''
  for (const key of newArgs) {
    string += `&${key}=${newArgs[key]}`
  }
  string = string.substr(1)
  return string
}

const sign = (ticket, url) => {
  const ret = {
    jsapi_ticket: ticket,
    nonceStr: createNonceStr(),
    timestamp: createTimestamp(),
    url,
  }
  const string = raw(ret)
  const shaObj = new JsSHA(string, 'TEXT')
  ret.signature = shaObj.getHash('SHA-1', 'HEX')

  return ret
}

export default sign
