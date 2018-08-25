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
    this.spriteImageColumns = 10
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

  async getThumbnailsInfo() {
    return {
      dirPath: this.getThumbnailsDirPublicPath(),
      count: await this.getThumbnailsCount(),
      sceneInterval: config.sceneInterval,
    }
  }

  //
  // Sprite Image
  //
  getSpriteImagePublicPath() {
    return path.join(
      '/thumbnails',
      this.md5(),
      this.getSpriteImageFileName())
  }
  
  getSpriteImagePath() {
    return path.join(
      __dirname,
      '../data/thumbnails/',
      this.md5(),
      this.getSpriteImageFileName())
  }

  getSpriteImageFileName() {
    return `interval-${config.sceneInterval}.jpg`
  }

  //
  // Thumbnail images
  //
  getThumbnailsDirPublicPath() {
    return path.join(
      '/thumbnails',
      this.md5(),
      `interval-${config.sceneInterval}`)
  }

  getThumbnailsDirPath() {
    return path.join(
      __dirname,
      '../data/thumbnails',
      this.md5(),
      `interval-${config.sceneInterval}`)
  }

  getThumbnailImagePath(time) {
    return path.join(this.getThumbnailsDirPath(), time + '.jpg')
  }

  //
  // Thumbnails count
  //
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
    console.log('Creating thumbnails:', this.basename())
    await fs.mkdirpAsync(this.getThumbnailsDirPath())
    const metadata = await this.getMetadata()
    const duration = Math.floor(metadata.format.duration)
    for (let time = 0; time < duration; time += config.sceneInterval) {
      await this.createThumbnailAt(time)
      this.emit('thumbnail-progress', time, duration)
    }
    console.log('Creating sprite image')
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
    // Check sprite image
    if (!await fs.existsAsync(this.getSpriteImagePath())) {
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
        //.on('stderr', stderr => console.log('    ffmpeg:', stderr))
        .save(this.getThumbnailImagePath(time))
    })
  }

  async createSpriteImage() {
    return new Promise(async resolve => {
      const metadata = await this.getMetadata()
      const duration = Math.floor(metadata.format.duration)
      const imageCount = Math.ceil(duration / config.sceneInterval)
      const rows = Math.ceil(imageCount / this.spriteImageColumns)
      const baseWidth = this.thumbnailWidth * this.spriteImageColumns
      const baseHeight = this.thumbnailHeight * rows
      new Jimp(baseWidth, baseHeight, async (err, baseImage) => {
        for (let index = 0; index < imageCount; index++) {
          const imagePath = this.getThumbnailImagePath(index * config.sceneInterval)
          const image = await Jimp.read(imagePath)
          const x = 160 * (index % this.spriteImageColumns)
          const y = 90 * Math.floor(index / this.spriteImageColumns)
          baseImage.blit(image, x, y)
        }
        baseImage.quality(90)
        baseImage.write(this.getSpriteImagePath())
        console.log('Sprite image:', this.getSpriteImagePath())
        resolve()
      })
    })
  }
}