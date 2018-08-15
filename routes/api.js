const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const crypto = require("crypto")
const ffmpeg = require('fluent-ffmpeg')
const config = require('config')
const mkpath = require('mkpath')
const Jimp = require('jimp')

router.get('/list/*', function(req, res, next) {  
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

router.get('/video-info/*', function(req, res, next) {
  const video = new Video(req.params[0])
  video.getMetadata((err, metadata) => {
    res.json({
      duration: metadata.format.duration,
      tiledImagePath: video.getTiledImageRelativePath(),
      existTiledImage: video.existTiledImage(),
      interval: 10
    })
  })
})

router.get('/video-file/*', function(req, res, next) {
  const time = req.query.time ? parseInt(req.query.time) : 0
  const video = new Video(req.params[0])
  video.getMetadata((err, metadata) => {
    // console.log(metadata)
    const sourceCodecs = metadata.streams.reduce((obj, stream) => {
      obj[stream.codec_type] = stream.codec_name
      return obj
    }, {})
    // const videoCodec = (sourceCodecs.video == 'h264') ? 'copy' : 'libx264'
    // const audioCodec = (sourceCodecs.audio.match(/mp3|aac/)) ? 'copy' : 'aac'
    const videoCodec = 'libx264'
    const audioCodec = 'aac'
    res.contentType('video/mp4')
    ffmpeg(video.getVideoPath())
      .seekInput(time)
      .format('mp4')
      .videoCodec(videoCodec)
      .videoBitrate(3 * 1024)
      .audioCodec(audioCodec)
      .audioBitrate(128)
      .outputOptions(['-movflags frag_keyframe+empty_moov'])
      .on('end', () => { console.log('Converted succesfully') })
      .on('error', (err) => { console.log(err.message) })
      .pipe(res, { end: true })
  })
})

router.get('/generate-thumbnails/*', function(req, res, next) {
  const video = new Video(req.params[0])
  video.generateThumbnails()
  res.json({})
})

class Video {
  constructor(relativePath) {
    this.relativePath = relativePath
    this.thumbnailWidth = 160
    this.thumbnailHeight = 90
    this.tiledImageColumns = 10
  }

  getVideoPath() {
    return path.join(config.videoRoot, this.relativePath)
  }

  basename() {
    return path.basename(this.relativePath)
  }

  getTiledImageRelativePath() {
    return path.join('/thumbnails', this.md5() + '.jpg')
  }
  
  getTiledImagePath() {
    return path.join(__dirname, '../data/public', this.getTiledImageRelativePath())
  }

  existTiledImage() {
    return fs.existsSync(this.getTiledImagePath())
  }

  getThumbnailsDirPath() {
    return path.join(__dirname, '../data/public/thumbnails', this.md5())
  }

  getThumbnailImagePath(time) {
    return path.join(this.getThumbnailsDirPath(), time + '.jpg')
  }

  md5() {
    const hash = crypto.createHash("md5")
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
    console.log(`Thumanbil: ${time} / ${duration} - ${this.basename()}`)
    const scaleOptions =
      `iw*(${this.thumbnailHeight}/ih)*sar:${this.thumbnailHeight},` +
      `pad=${this.thumbnailWidth}:${this.thumbnailHeight}:(ow-iw)/2:(oh-ih)/2`
    ffmpeg(this.getVideoPath())
      .seekInput(time)
      .format('image2')
      .noAudio()
      .outputOptions([
        '-vframes 1',
        '-vsync 0',
        `-vf scale=${scaleOptions}`
      ])
      .on('end', (stdout, stderr) => {
        if (time + interval > duration) {
          console.log('Finish generating all thumbnails:', this.getThumbnailsDirPath())
          // Generate tiled image
          this.generateTiledImage(duration, interval)
        } else {
          // Generate next image
          this._generateThumbnails(duration, interval, time + interval)
        }
      })
      .on('error', (err, stdout, stderr) => {
        console.log('Cannot create thumbnails: ' + err.message)
      })
      .save(this.getThumbnailImagePath(time))
  }

  generateTiledImage(duration, interval) {
    console.log('Generate base image')
    duration = Math.floor(duration)
    const imageCount = Math.floor(duration / interval)
    const rows = Math.ceil(imageCount / this.tiledImageColumns)
    const width = this.thumbnailWidth * this.tiledImageColumns
    const height = this.thumbnailHeight * rows
    new Jimp(width, height, (err, image) => {
      console.log(imageCount, interval, image, 0)
      this._addToBaseImage(imageCount, interval, image, 0)
    })
  }

  _addToBaseImage(imageCount, interval, baseImage, currentIndex) {
    console.log('Add to tiled image:', `${currentIndex} / ${imageCount} - ${this.basename()}`)
    const imagePath = this.getThumbnailImagePath(currentIndex * interval)
    const x = 160 * (currentIndex % this.tiledImageColumns)
    const y = 90 * Math.floor(currentIndex / this.tiledImageColumns)
    Jimp.read(imagePath)
      .then(image => {
        baseImage.blit(image, x, y)
        if (currentIndex == imageCount) {
          console.log('Saving')
          baseImage.quality(90)
          baseImage.write(this.getTiledImagePath())
          console.log('Finish generating tiled image:', this.getTiledImagePath())
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
