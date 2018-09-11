const express = require('express')
const { map } = require('p-iteration')
const Video = require('../lib/video')
const VideoDir = require('../lib/video-dir')
const ThumbnailerQueue = require('../lib/thumbnailer-queue')
const router = express.Router()

//
// List
//
router.get('/dir/list/*', async (req, res) => {
  const videoDir = new VideoDir(req.params[0])
  const { entries, totalCount } = await videoDir.getEntriesAndTotalCount(
    req.query.limit ? parseInt(req.query.limit) : null,
    req.query.offset ? parseInt(req.query.offset) : 0
  )
  res.json({
    entries: await map(entries, entry => entry.toJson()),
    totalCount: totalCount
  })
})

//
// Search
//
router.get('/search/:query', async (req, res) => {
  const videoDir = new VideoDir('')
  const entries = await videoDir.searchEntries(req.params.query)
  res.json(await map(entries, entry => entry.toJson()))
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
// Random
//
router.get('/random', async (req, res) => {
  const videoDir = new VideoDir('')
  const video = await videoDir.getRandomVideo()
  res.json({
    path: video.relativePath
  })
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
