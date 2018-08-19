const express = require('express')
const config = require('config')
const router = express.Router()

router.get('/*', function(req, res) {
  res.render('index', { title: config.title })
})

module.exports = router
