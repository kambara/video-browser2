const crypto = require('crypto')
const EventEmitter = require('events')
const fs = require('fs-extra-promise')
const path = require('path')
const config = require('config')
const ffmpeg = require('fluent-ffmpeg')
const Jimp = require('jimp')

module.exports = class Video extends EventEmitter {
  constructor(relativePath) {
    super()
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

  async getMetadata() {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(this.getVideoPath(), (err, metadata) => {
        if (err) {
          reject(err)
        } else {
          resolve(metadata)
        }
      })
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
      '../data/thumbnails',
      this.getAllScenesImageFileName())
  }

  getAllScenesImageFileName() {
    return this.md5() + '.jpg'
  }

  //
  // Thumbnail Images
  //
  getThumbnailsDirPublicPath() {
    return path.join('/thumbnails', this.md5())
  }

  getThumbnailsDirPath() {
    return path.join(__dirname, '../data/thumbnails', this.md5())
  }

  getThumbnailImagePath(time) {
    return path.join(this.getThumbnailsDirPath(), time + '.jpg')
  }

  async getThumbnailsCount() {
    if (! await fs.existsAsync(this.getThumbnailsDirPath()) ) {
      return 0
    }
    const entries = await fs.readdirAsync(this.getThumbnailsDirPath())
    return entries.filter(entry => !!entry.match(/\.jpg$/)).length
  }

  //
  // Create thumbnails
  //
  async createThumbnails() {
    await fs.mkdirpAsync(this.getThumbnailsDirPath())
    const metadata = await this.getMetadata()
    const duration = Math.floor(metadata.format.duration)
    for (let time = 0; time < duration; time += config.sceneInterval) {
      console.log(`Create thumbnail (${time}/${duration}) ${this.basename()}`)
      await this.createThumbnailAt(time)
      this.emit('thumbnail-progress', time, duration)
    }
    await this.createSpriteImage()
  }

  async existThumbnails() {
    // Check directory
    if (!await fs.existsAsync(this.getThumbnailsDirPath())) {
      return false
    }
    // Check thumbnails
    const metadata = await this.getMetadata()
    const duration = Math.floor(metadata.format.duration)
    for (let time = 0; time < duration; time += config.sceneInterval) {
      if (!await fs.existsAsync(this.getThumbnailImagePath(time))) {
        return false
      }
    }
    // Check allScenesImage
    if (!await fs.existsAsync(this.getAllScenesImagePath())) {
      return false
    }
    return true
  }

  createThumbnailAt(time) {
    return new Promise((resolve, reject) => {
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
          resolve()
        })
        .on('error', (err) => {
          console.error('Cannot create thumbnails: ' + err.message)
          reject()
        })
        // .on('stderr', stderr => console.log('    ffmpeg:', stderr))
        .save(this.getThumbnailImagePath(time))
    })
  }

  async createSpriteImage() {
    return new Promise(async resolve => {
      console.log('Creating sprite image')
      const metadata = await this.getMetadata()
      const duration = Math.floor(metadata.format.duration)
      const imageCount = Math.ceil(duration / config.sceneInterval)
      const rows = Math.ceil(imageCount / this.allScenesImageColumns)
      const baseWidth = this.thumbnailWidth * this.allScenesImageColumns
      const baseHeight = this.thumbnailHeight * rows
      new Jimp(baseWidth, baseHeight, async (err, baseImage) => {
        for (let index = 0; index < imageCount; index++) {
          const imagePath = this.getThumbnailImagePath(index * config.sceneInterval)
          const image = await Jimp.read(imagePath)
          const x = 160 * (index % this.allScenesImageColumns)
          const y = 90 * Math.floor(index / this.allScenesImageColumns)
          baseImage.blit(image, x, y)
        }
        baseImage.quality(90)
        baseImage.write(this.getAllScenesImagePath())
        console.log('Sprite image:', this.getAllScenesImagePath())
        resolve()
      })
    })
  }
}