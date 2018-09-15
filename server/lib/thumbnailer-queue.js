const EventEmitter = require('events').EventEmitter
const kue = require('kue')
const Video = require('./video')
const VideoDir = require('./video-dir')
const debug = require('debug')('video-browser2:thumbnailer')
const config = require('config')

const queue = kue.createQueue()
const emitter = new EventEmitter()

const ThumbnailerQueue = {
  async add(video) {
    if (await video.existThumbnails()) {
      debug('Thumbnails already exist:', video.basename())
      return false
    }
    if (await isQueued(video)) {
      debug('Thumbnails have been already queued', video.basename())
      return false
    }
    queue.create('thumbnail', {
      title: video.basename(),
      relativePath: video.relativePath,
      videoRoot: config.videoRoot,
    }).save((err) => {
      if (err) throw err
    })
    return true
  },
  async addVideos(dirRelativePath) {
    const videoDir = new VideoDir(dirRelativePath)
    let jobCount = 0
    for (const video of await videoDir.getVideos()) {
      const isAdded = await this.add(video)
      if (isAdded) jobCount++
    }
    return jobCount
  },
  async addVideosRecursively(dirRelativePath) {
    const videoDir = new VideoDir(dirRelativePath)
    let jobCount = 0
    for (const video of await videoDir.getVideosRecursive()) {
      const isAdded = await this.add(video)
      if (isAdded) jobCount++
    }
    return jobCount
  },
  onProgress(callback) {
    emitter.on('progress', info => callback(info))
  },
  onComplete(callback) {
    emitter.on('complete', info => callback(info))
  },
}

queue.process('thumbnail', async (job, done) => {
  const video = new Video(job.data.relativePath)
  if (await video.existThumbnails()) {
    return done()
  }
  video.on('thumbnail-progress', (time, duration) => {
    job.progress(time, duration)
  })
  try {
    await video.createThumbnails()
  } catch (err) {
    debug('Error: Cannot create thumbnails:', err.message)
    return done(err)
  }
  done()
})

queue.on('job progress', async (id, progress) => {
  const job = await getJob(id)
  if (job.data.videoRoot !== config.videoRoot) return
  const activeCount = await getActiveCount()
  const inactiveCount = await getInactiveCount()
  const completeCount = await getCompleteCount()
  const failedCount = await getFailedCount()
  const totalCount = activeCount
    + inactiveCount
    + completeCount
    + failedCount
  emitter.emit('progress', {
    thumbnailerQueue: {
      title: job.data.title,
      progress: progress,
      totalCount: totalCount,
      completeCount: completeCount,
      failedCount: failedCount,
    },
    mutation: 'SOCKET_THUMBNAILER_PROGRESS',
  })
})

queue.on('job complete', async () => {
  emitter.emit('complete', {
    mutation: 'SOCKET_THUMBNAILER_COMPLETE'
  })
  const inactiveCount = await getInactiveCount()
  if (inactiveCount == 0) {
    removeAllJobs()
  }
})

function removeAllJobs() {
  queue.complete((err, ids) => {
    removeJobs(ids)
  })
  queue.active((err, ids) => {
    removeJobs(ids)
  })
}

function removeJobs(ids) {
  ids.forEach((id) => {
    kue.Job.get(id, (err, job) => {
      job.remove((err) => {
        if (err) throw err
        debug('Removed completed job:', job.data.title)
      })
    })
  })
}

//
// isJobAddedInQueue
//
function isQueued(video) {
  return new Promise(async (resolve) => {
    if (await isVideoContainedInJobIds(await getActiveJobIds(), video)
      || await isVideoContainedInJobIds(await getInactiveJobIds(), video)
      || await isVideoContainedInJobIds(await getCompleteJobIds(), video)
      || await isVideoContainedInJobIds(await getFailedJobIds(), video)
    ) {
      return resolve(true)
    }
    resolve(false)
  })
}

function isVideoContainedInJobIds(ids, video) {
  return new Promise(async resolve => {
    for (const id of ids) {
      const job = await getJob(id)
      if (job.data.relativePath === video.relativePath) {
        return resolve(true)
      }
    }
    resolve(false)
  })
}

function getJob(id) {
  return new Promise((resolve, reject) => {
    kue.Job.get(id, (err, job) => {
      if (err) {
        reject(err)
      } else {
        resolve(job)
      }
    })
  })
}

//
// Job IDs
//
function getInactiveJobIds() {
  return new Promise(resolve => {
    queue.inactive((err, ids) => {
      resolve(ids)
    })
  })
}

function getActiveJobIds() {
  return new Promise(resolve => {
    queue.active((err, ids) => {
      resolve(ids)
    })
  })
}

function getCompleteJobIds() {
  return new Promise(resolve => {
    queue.complete((err, ids) => {
      resolve(ids)
    })
  })
}

function getFailedJobIds() {
  return new Promise(resolve => {
    queue.failed((err, ids) => {
      resolve(ids)
    })
  })
}

//
// Job count
//
function getInactiveCount() {
  return new Promise((resolve) => {
    queue.inactiveCount((err, total) => {
      resolve(total)
    })
  })
}

function getActiveCount() {
  return new Promise((resolve) => {
    queue.activeCount((err, total) => {
      resolve(total)
    })
  })
}

function getCompleteCount() {
  return new Promise((resolve) => {
    queue.completeCount((err, total) => {
      resolve(total)
    })
  })
}

function getFailedCount() {
  return new Promise((resolve) => {
    queue.failedCount((err, total) => {
      resolve(total)
    })
  })
}

module.exports = ThumbnailerQueue
