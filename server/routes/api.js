const express = require('express')
const router = express.Router()
const ffmpeg = require('fluent-ffmpeg')
const Video = require('../lib/video')
const VideoDir = require('../lib/video-dir')

router.get('/list/*', function(req, res) {
  const videoDir = new VideoDir(req.params[0])
  videoDir.getEntriesJson((err, json) => {
    res.json(json)
  })
})

router.get('/video-info/*', function(req, res) {
  const video = new Video(req.params[0])
  video.getMetadata((err, metadata) => {
    res.json({
      duration: metadata.format.duration,
      allScenesImagePath: video.getAllScenesImagePublicPath(),
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
