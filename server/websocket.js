const express = require('express')
const ThumbnailerQueue = require('./lib/thumbnailer-queue')

const app = express()
const expressWs = require('express-ws')(app)

app.ws('/', () => {})

// Broadcast thumbnail creation progress
ThumbnailerQueue.onProgress((info) => {
  expressWs.getWss('/').clients.forEach((client) => {
    client.send(JSON.stringify(info))
  })
})

ThumbnailerQueue.onComplete((info) => {
  expressWs.getWss('/').clients.forEach((client) => {
    client.send(JSON.stringify(info))
  })
})

module.exports = app
