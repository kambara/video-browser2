const WebSocket = require('ws')
const debug = require('debug')('video-browser2:websocket')
const ThumbnailerQueue = require('./lib/thumbnailer-queue')

const wss = new WebSocket.Server({ noServer: true })

wss.on('connection', function connection() {
  debug('connect')
})

ThumbnailerQueue.onProgress((json) => {
  broadcast(json)
})

ThumbnailerQueue.onComplete((json) => {
  broadcast(json)
})

function broadcast(json) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(json))
    }
  })
}

module.exports = wss