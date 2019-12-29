const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')

router.get('/*', function(req, res) {
  fs.readFile(path.join(__dirname, '../../public/index.html'), (err, data) => {
    if (err) throw err
    res.set('content-type', 'text/html')
    res.send(data)
    res.end()
  })
})

module.exports = router