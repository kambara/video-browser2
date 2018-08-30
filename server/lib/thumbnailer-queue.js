const EventEmitter = require('events').EventEmitter
const kue = require('kue')
const Video = require('./video')
const debug = require('debug')('video-browser2:thumbnailer')

const queue = kue.createQueue()
const emitter = new EventEmitter()

const ThumbnailerQueue = {
  async addJob(video) {
    if (await video.existThumbnails()) {
      return false
    }
    queue.create('thumbnail', {
      title: video.basename(),
      relativePath: video.relativePath
    }).save((err) => {
      if (err) throw err
    })
    return true
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
  if (!await video.existThumbnails()) {
    video.on('thumbnail-progress', (time, duration) => {
      job.progress(time, duration)
    })
    try {
      await video.createThumbnails()
    } catch (err) {
      console.error('Cannot create thumbnails:', err.message)
      return done(err)
    }
  }
  done()
})

queue.on('job progress', async (id, progress) => {
  const activeCount = await getActiveCount()
  const inactiveCount = await getInactiveCount()
  const completeCount = await getCompleteCount()
  const failedCount = await getFailedCount()
  const totalCount = activeCount
    + inactiveCount
    + completeCount
    + failedCount
  kue.Job.get(id, (err, job) => {
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