const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const ffmpeg = require('fluent-ffmpeg')
const config = require('config')

router.get('/list/*', function(req, res, next) {  
  const relativeDirPath = req.params[0]
  console.log(relativeDirPath)
  const dirPath = path.join(config.videoRoot, relativeDirPath)
  fs.readdir(dirPath, (err, entries) => {
    entries = entries
      .filter(entry => {
        if (path.basename(entry).match(/^\./)) return false
        return true
      })
      .map(entry => {
        const entryPath = path.join(dirPath, entry)
        const stat = fs.statSync(entryPath)
        const type = stat.isDirectory() ? 'directory' : 'file'
        return {
          type: type,
          path: path.join(relativeDirPath, entry)
        }
      })
    res.json(entries)
  })
})

router.get('/video-info/*', function(req, res, next) {
  const relativeFilePath = req.params[0]
  const filePath = path.join(config.videoRoot, relativeFilePath)
  ffmpeg.ffprobe(filePath, (err, metadata) => {
    console.log(metadata)
    res.json({
      duration: metadata.format.duration
    })
  })
})

router.get('/video-file/*', function(req, res, next) {
  const time = req.query.time ? parseInt(req.query.time) : 0
  const relativeFilePath = req.params[0]
  const filePath = path.join(config.videoRoot, relativeFilePath)
  res.contentType('video/mp4')
  const proc = ffmpeg(filePath)
    .seekInput(time)
    .format('mp4')
    .videoCodec('libx264')
    .videoBitrate('3072k')
    .audioCodec('aac')
    .audioBitrate('128k')
    .outputOptions([
      '-movflags frag_keyframe+empty_moov'
    ])
    .on('end', () => {
      console.log('file has been converted succesfully')
    })
    .on('error', (err) => {
      console.log('an error happened: ' + err.message)
    })
    .pipe(res, {end: true})
})

module.exports = router
