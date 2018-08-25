const EventEmitter = require('events').EventEmitter
const path = require('path')
const kue = require('kue')
const Video = require('./video')

const queue = kue.createQueue()
const emitter = new EventEmitter()

const ThumbnailerQueue = {
  addJob(relativePath) {
    queue.create('thumbnail', {
      title: path.basename(relativePath),
      relativePath: relativePath
    }).save((err) => {
      if (err) {
        console.error('Unable to create new job:', relativePath, err)
      }
    })
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
    await video.createThumbnails()
  }
  done()
})

queue.on('job enqueue', (id, type) => {
  console.log(`Job #${id} got queued of type ${type}`)
})

queue.on('job progress', async (id, progress) => {
  const activeCount = await getActiveCount()
  const inactiveCount = await getInactiveCount()
  const completeCount = await getCompleteCount()
  const failedCount = await getFailedCount()
  const totalCount = activeCount + inactiveCount + completeCount + failedCount
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
        console.log('Removed completed job:', job.data.title)
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