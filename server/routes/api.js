const express = require('express')
const router = express.Router()
const ffmpeg = require('fluent-ffmpeg')
const Video = require('../lib/video')
const VideoDir = require('../lib/video-dir')
const ThumbnailerQueue = require('../lib/thumbnailer-queue')

router.get('/dir/list/*', async function(req, res) {
  const videoDir = new VideoDir(req.params[0])
  const json = await videoDir.getEntriesJson()
  res.json(json)
})

router.get('/video/info/*', async function(req, res) {
  const video = new Video(req.params[0])
  const metadata = await video.getMetadata()
  res.json({
    duration: metadata.format.duration,
    allScenesImagePath: video.getAllScenesImagePublicPath(),
    interval: 10
  })
})

router.get('/video/file/*', async function(req, res) {
  const time = req.query.time ? parseInt(req.query.time) : 0
  const video = new Video(req.params[0])
  const metadata = await video.getMetadata()
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
    // .on('stderr', stderr => console.log('    ffmpeg:', stderr))
    .on('error', err => console.log('Error:', err.message))
    .pipe(res, { end: true })
})

router.get('/video/thumbnails/create/*', function(req, res) {
  ThumbnailerQueue.addJob(req.params[0])
  res.json({})
})

router.get('/dir/thumbnails/create/*', async function(req, res) {
  const videoDir = new VideoDir(req.params[0])
  const videos = await videoDir.getVideos()
  for (const video of videos) {
    ThumbnailerQueue.addJob(video.relativePath)
  }
  res.json({})
})

router.get('/dir/thumbnails/create-recursive/*', async function(req, res) {
  const videoDir = new VideoDir(req.params[0])
  const videos = await videoDir.getVideosRecursive()
  for (const video of videos) {
    ThumbnailerQueue.addJob(video.relativePath)
  }
  res.json({})
})

module.exports = router
