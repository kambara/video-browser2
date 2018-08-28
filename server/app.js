const createError = require('http-errors')
const http = require('http')
const url = require('url')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const stylus = require('stylus')
const indexRouter = require('./routes/index')
const apiRouter = require('./routes/api')
const wss = require('./websocket')

// Create app and server
const app = express()
const server = http.createServer(app)

// Setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
// app.use(basicAuth({
//   users: {
//     kambara: 'hoge'
//   }
// }))
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(stylus.middleware(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/thumbnails', express.static(path.join(__dirname, 'data/thumbnails')))

// Router
app.use('/api', apiRouter)
app.use('/', indexRouter)

// WebSocket
server.on('upgrade', function upgrade(request, socket, head) {
  const pathname = url.parse(request.url).pathname
  if (pathname === '/ws/') {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request)
    })
  } else {
    socket.destroy()
  }
})

// 404
app.use((req, res, next) => {
  next(createError(404))
})

// Error handler
app.use((err, req, res) => {
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  res.status(err.status || 500)
  res.render('error')
})

// module.exports = app
module.exports = {app, server}
