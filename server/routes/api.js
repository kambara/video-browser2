const config = require('config')
const express = require('express')
const router = express.Router()
const ffmpeg = require('fluent-ffmpeg')
const debugFfmpeg = require('debug')('video-browser2:ffmpeg')
const debug = require('debug')('video-browser2:api')
const Video = require('../lib/video')
const VideoDir = require('../lib/video-dir')
const ThumbnailerQueue = require('../lib/thumbnailer-queue')

//
// List
//
router.get('/dir/list/*', async (req, res) => {
  const videoDir = new VideoDir(req.params[0])
  const list = await videoDir.getEntryInfoList()
  res.json(list)
})

//
// Video
//
router.get('/video/info/*', async (req, res) => {
  const video = new Video(req.params[0])
  const metadata = await video.getMetadata()
  res.json({
    duration: metadata.format.duration,
    spriteImagePath: video.getSpriteImagePublicPath(),
    interval: 10
  })
})

router.get('/video/file/*', async (req, res) => {
  const time = req.query.time ? parseInt(req.query.time) : 0
  const video = new Video(req.params[0])
  const metadata = await video.getMetadata()
  // debug(metadata)
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
    .on('end', () => debug('Converted succesfully'))
    .on('stderr', stderr => debugFfmpeg(stderr))
    .on('error', err => debug(err.message))
    .pipe(res, { end: true })
})

//
// Thumbnail creation
//
router.get('/video/thumbnails/create/*', async (req, res) => {
  const video = new Video(req.params[0])
  const isAdded = await ThumbnailerQueue.addJob(video)
  res.json({
    jobCount: isAdded ? 1 : 0
  })
})

router.get('/dir/thumbnails/create/*', async (req, res) => {
  const videoDir = new VideoDir(req.params[0])
  let jobCount = 0
  for (const video of await videoDir.getVideos()) {
    const isAdded = await ThumbnailerQueue.addJob(video)
    if (isAdded) jobCount++
  }
  res.json({
    jobCount: jobCount
  })
})

router.get('/dir/thumbnails/create-recursive/*', async (req, res) => {
  const videoDir = new VideoDir(req.params[0])
  let jobCount = 0
  for (const video of await videoDir.getVideosRecursive()) {
    const isAdded = await ThumbnailerQueue.addJob(video)
    if (isAdded) jobCount++
  }
  res.json({
    jobCount: jobCount
  })
})

router.get('/websocket-port', (req, res) => {
  res.json({
    port: config.webSocketPort
  })
})

module.exports = router
