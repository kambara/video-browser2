const path = require('path')
const kue = require('kue')
const Video = require('./video')

const queue = kue.createQueue()

module.exports = {
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
  getQueuedCount() {
    return new Promise((resolve, reject) => {
      queue.inactiveCount((err, total) => {
        if (err) {
          reject(err)
        }
        resolve(total)
      })
    })
  },
  getActiveJob() {
    return new Promise((resolve, reject) => {
      queue.active((err, ids) => {
        if (err) {
          reject(err)
        }
        if (ids && ids.length > 0) {
          kue.Job.get(ids[0], (err, job) => {
            resolve(job)
          })
        } else {
          resolve(null)
        }
      })
    })
  }
}

queue.process('thumbnail', async (job, done) => {
  console.log('Process job:', job.data.title)
  const video = new Video(job.data.relativePath)
  video.on('progress', (time, duration) => {
    job.progress(time, duration)
  })
  await video.createThumbnails()
  done()
})

queue.on('job enqueue', (id, type) => {
  console.log(`Job #${id} got queued of type ${type}`)
})

queue.on('job complete', (id) => {
  kue.Job.get(id, (err, job) => {
    if (err) return
    job.remove((err) => {
      if (err) throw err
      console.log(`Removed completed job #${job.id}`)
    })
  })
})
