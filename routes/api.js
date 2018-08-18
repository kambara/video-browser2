const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const ffmpeg = require('fluent-ffmpeg')
const config = require('config')
const mkpath = require('mkpath')
const Jimp = require('jimp')

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

class Video {
  constructor(relativePath) {
    this.relativePath = relativePath
    this.thumbnailWidth = 160
    this.thumbnailHeight = 90
    this.allScenesImageColumns = 10
  }

  getVideoPath() {
    return path.join(config.videoRoot, this.relativePath)
  }

  basename() {
    return path.basename(this.relativePath)
  }

  getAllScenesImageRelativePath() {
    return path.join('/thumbnails', this.md5() + '.jpg')
  }
  
  getAllScenesImagePath() {
    return path.join(
      __dirname,
      '../data/public',
      this.getAllScenesImageRelativePath())
  }

  existAllScenesImage() {
    return fs.existsSync(this.getAllScenesImagePath())
  }

  getThumbnailsDirPath() {
    return path.join(__dirname, '../data/public/thumbnails', this.md5())
  }

  getThumbnailImagePath(time) {
    return path.join(this.getThumbnailsDirPath(), time + '.jpg')
  }

  md5() {
    const hash = crypto.createHash('md5')
    hash.update(this.relativePath)
    return hash.digest('hex')
  }

  getMetadata(callback) {
    ffmpeg.ffprobe(this.getVideoPath(), (err, metadata) => {
      callback(err, metadata)
    })
  }

  generateThumbnails() {
    this.getMetadata((err, metadata) => {
      mkpath.sync(this.getThumbnailsDirPath())
      const duration = Math.floor(metadata.format.duration)
      this._generateThumbnails(duration, 10, 0)
    })
  }

  _generateThumbnails(duration, interval, time) {
    console.log(`Thumbnail: ${time} / ${duration} - ${this.basename()}`)
    ffmpeg(this.getVideoPath())
      .seekInput(time)
      .format('image2')
      .noAudio()
      .videoFilters([
        {
          filter: 'scale',
          options: [
            `min(trunc(oh*a*sar/2)*2, ${this.thumbnailWidth})`,
            this.thumbnailHeight
          ]
        },
        {
          filter: 'pad',
          options: [
            this.thumbnailWidth,
            this.thumbnailHeight,
            '(ow-iw)/2',
            '(oh-ih)/2'
          ]
        }
      ])
      .outputOptions([
        '-vframes 1',
        '-vsync 0',
      ])
      .on('end', () => {
        if (time + interval > duration) {
          console.log('Finish generating all thumbnails:', this.getThumbnailsDirPath())
          // Generate all scenes image
          this.generateAllScenesImage(duration, interval)
        } else {
          // Generate next image
          this._generateThumbnails(duration, interval, time + interval)
        }
      })
      .on('error', (err) => {
        console.log('Cannot create thumbnails: ' + err.message)
      })
      // .on('stderr', stderr => console.log('    ffmpeg:', stderr))
      .save(this.getThumbnailImagePath(time))
  }

  generateAllScenesImage(duration, interval) {
    console.log('Generate base image')
    duration = Math.floor(duration)
    const imageCount = Math.floor(duration / interval)
    const rows = Math.ceil(imageCount / this.allScenesImageColumns)
    const width = this.thumbnailWidth * this.allScenesImageColumns
    const height = this.thumbnailHeight * rows
    new Jimp(width, height, (err, image) => {
      console.log(imageCount, interval, image, 0)
      this._addToBaseImage(imageCount, interval, image, 0)
    })
  }

  _addToBaseImage(imageCount, interval, baseImage, currentIndex) {
    console.log('Add to base image:', `${currentIndex} / ${imageCount} - ${this.basename()}`)
    const imagePath = this.getThumbnailImagePath(currentIndex * interval)
    const x = 160 * (currentIndex % this.allScenesImageColumns)
    const y = 90 * Math.floor(currentIndex / this.allScenesImageColumns)
    Jimp.read(imagePath)
      .then(image => {
        baseImage.blit(image, x, y)
        if (currentIndex == imageCount) {
          console.log('Saving')
          baseImage.quality(90)
          baseImage.write(this.getAllScenesImagePath())
          console.log('Finish generating image:', this.getAllScenesImagePath())
        } else {
          this._addToBaseImage(imageCount, interval, baseImage, currentIndex + 1)
        }
      })
      .catch(err => {
        console.error(err.message)
      })
  }
}

module.exports = router
