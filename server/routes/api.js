const express = require('express')
const Video = require('../lib/video')
const VideoDir = require('../lib/video-dir')
const ThumbnailerQueue = require('../lib/thumbnailer-queue')

const router = express.Router()

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
  const video = new Video(req.params[0])
  const time = req.query.time ? parseInt(req.query.time) : 0
  video.stream(res, time)
})

//
// Thumbnail creation
//
router.post('/video/thumbnails/create/*', async (req, res) => {
  const video = new Video(req.params[0])
  const isAdded = await ThumbnailerQueue.addJob(video)
  res.json({
    jobCount: isAdded ? 1 : 0
  })
})

router.post('/dir/thumbnails/create/*', async (req, res) => {
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

router.post('/dir/thumbnails/create-recursive/*', async (req, res) => {
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

module.exports = router
