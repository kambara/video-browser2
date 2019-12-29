const basicAuth = require('basic-auth')
const config = require('config')
const requestIp = require('request-ip')
const rangeCheck = require('range_check')

module.exports = (req, res, next) => {
  if (!config.basicAuth
    || !config.basicAuth.name
    || !config.basicAuth.password
  ) {
    return next()
  }
  if (isExempted(req)) {
    return next()
  }
  const credentials = basicAuth(req)
  if (!credentials
    || credentials.name !== config.basicAuth.name
    || credentials.pass !== config.basicAuth.password
  ) {
    res.set('WWW-Authenticate', 'Basic realm="Authorization Required"')
    return res.status(401).send('Access denied')
  }
  next()
}

function isExempted(req) {
  if (!config.basicAuth.exempt
    || config.basicAuth.exempt.length === 0
  ) {
    return false
  }
  const clientIp = requestIp.getClientIp(req)
  const abbrClientIp = rangeCheck.storeIP(clientIp)
  for (const exemptIp of config.basicAuth.exempt) {
    if (rangeCheck.isRange(exemptIp)) {
      if (rangeCheck.inRange(abbrClientIp, exemptIp)) {
        return true
      }
    } else if (rangeCheck.isIP(exemptIp)) {
      if (abbrClientIp === exemptIp) {
        return true
      }
    }
  }
  return false
}