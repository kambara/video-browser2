const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const config = require('config')
const ffmpeg = require('fluent-ffmpeg')
const mkpath = require('mkpath')
const Jimp = require('jimp')

module.exports = class Video {
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

  //
  // AllScenesImage
  //
  getAllScenesImagePublicPath() {
    return path.join('/thumbnails', this.getAllScenesImageFileName())
  }
  
  getAllScenesImagePath() {
    return path.join(
      __dirname,
      '../data/public/thumbnails',
      this.getAllScenesImageFileName())
  }

  getAllScenesImageFileName() {
    return this.md5() + '.jpg'
  }

  existAllScenesImage() {
    return fs.existsSync(this.getAllScenesImagePath())
  }

  //
  // Thumbnail Images
  //
  getThumbnailsDirPublicPath() {
    return path.join('/thumbnails', this.md5())
  }

  getThumbnailsDirPath() {
    return path.join(__dirname, '../data/public/thumbnails', this.md5())
  }

  getThumbnailImagePath(time) {
    return path.join(this.getThumbnailsDirPath(), time + '.jpg')
  }

  getThumbnailsCount() {
    if (!fs.existsSync(this.getThumbnailsDirPath())) {
      return 0
    }
    return fs.readdirSync(this.getThumbnailsDirPath())
      .filter(entry => !!entry.match(/\.jpg$/))
      .length
  }

  //
  // Generate Thumbnails
  //
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

  //
  // Generate AllScenesImage
  //
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