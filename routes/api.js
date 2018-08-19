const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const ffmpeg = require('fluent-ffmpeg')
const config = require('config')
const Video = require('./video')

router.get('/list/*', function(req, res) {  
  const relativeDirPath = req.params[0]
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

router.get('/video-info/*', function(req, res) {
  const video = new Video(req.params[0])
  video.getMetadata((err, metadata) => {
    res.json({
      duration: metadata.format.duration,
      allScenesImagePath: video.getAllScenesImageRelativePath(),
      interval: 10
    })
  })
})

router.get('/video-file/*', function(req, res) {
  const time = req.query.time ? parseInt(req.query.time) : 0
  const video = new Video(req.params[0])
  video.getMetadata((err, metadata) => {
    // console.log(metadata)
    const sourceCodecs = metadata.streams.reduce((obj, stream) => {
      obj[stream.codec_type] = stream.codec_name
      return obj
    }, {})
    const videoCodec = (sourceCodecs.video == 'h264') ? 'copy' : 'libx264'
    const audioCodec = (sourceCodecs.audio.match(/mp3|aac/)) ? 'copy' : 'aac'
    res.contentType('video/mp4')
    ffmpeg(video.getVideoPath())
      .seekInput(time)
      .format('mp4')
      .videoCodec(videoCodec)
      .videoBitrate(3 * 1024)
      .audioCodec(audioCodec)
      .audioBitrate(128)
      .outputOptions(['-movflags frag_keyframe+empty_moov'])
      .on('end', () => console.log('Converted succesfully'))
      .on('stderr', stderr => console.log('    ffmpeg:', stderr))
      .on('error', err => console.log('Error:', err.message))
      .pipe(res, { end: true })
  })
})

router.get('/generate-thumbnails/*', function(req, res) {
  const video = new Video(req.params[0])
  video.generateThumbnails()
  res.json({})
})



module.exports = router
