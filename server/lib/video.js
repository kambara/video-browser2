const crypto = require('crypto')
const fs = require('fs-extra-promise')
const os = require('os')
const path = require('path')
const config = require('config')
const ffmpeg = require('fluent-ffmpeg')
const Jimp = require('jimp')
const debug = require('debug')('video-browser2:video')
const debugFfmpeg = require('debug')('video-browser2:ffmpeg')
const Entry = require('./entry')

module.exports = class Video extends Entry {
  constructor(relativePath) {
    super(relativePath)
    this.relativePath = relativePath
    this.thumbnailWidth = 160
    this.thumbnailHeight = 90
    this.spriteImageColumns = 10
  }

  md5() {
    const hash = crypto.createHash('md5')
    hash.update(this.relativePath)
    return hash.digest('hex')
  }

  async getMetadata() {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(this.getAbsolutePath(), (err, metadata) => {
        if (err) {
          reject(err)
        } else {
          resolve(metadata)
        }
      })
    })
  }

  async getVideoCodec() {
    const metadata = await this.getMetadata()
    for (const stream of metadata.streams) {
      if (stream.codec_type === 'video') {
        return stream.codec_name
      }
    }
    return null
  }

  async getAudioCodec() {
    const metadata = await this.getMetadata()
    for (const stream of metadata.streams) {
      if (stream.codec_type === 'audio') {
        return stream.codec_name
      }
    }
    return null
  }

  async getThumbnailsInfo() {
    return {
      dirPath: this.getThumbnailsDirPublicPath(),
      count: await this.getThumbnailsCount(),
      sceneInterval: config.sceneInterval,
    }
  }

  async toJson() {
    return {
      type: 'video',
      path: this.relativePath,
      thumbnails: await this.getThumbnailsInfo()
    }
  }

  //
  // stream
  //
  async stream(res, time = 0) {
    const streamAudioCodec = (await this.getAudioCodec() === 'aac') ? 'copy' : 'aac'
    let streamVideoCodec = (await this.getVideoCodec() === 'h264') ? 'copy' : 'libx264'
    const inputOptions = []
    const videoFilters = []
    // Hardware Acceleration
    if (streamVideoCodec !== 'copy') {
      if (config.ffmpeg.vaapiEnabled && os.type() === 'Linux') {
        streamVideoCodec = 'h264_vaapi'
        inputOptions.push(`-vaapi_device ${config.ffmpeg.vaapiDevice}`)
        videoFilters.push('format=nv12,hwupload')
      } else if (config.ffmpeg.videoToolboxEnabled && os.type() === 'Darwin') {
        streamVideoCodec = 'h264_videotoolbox'
      }
    }
    res.contentType('video/mp4')
    ffmpeg(this.getAbsolutePath())
      .seekInput(time)
      .inputOptions(inputOptions)
      .format('mp4')
      .videoCodec(streamVideoCodec)
      .videoBitrate(3 * 1024)
      .videoFilters(videoFilters)
      .audioCodec(streamAudioCodec)
      .audioBitrate(128)
      .outputOptions(['-movflags frag_keyframe+empty_moov'])
      .on('end', () => debug('Converted succesfully'))
      // .on('stderr', stderr => debugFfmpeg(stderr))
      .on('error', err => debug(err.message))
      .pipe(res, { end: true })
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
    debug('Creating thumbnails:', this.basename())
    await fs.mkdirpAsync(this.getThumbnailsDirPath())
    const metadata = await this.getMetadata()
    const duration = Math.floor(metadata.format.duration)
    for (let time = 0; time < duration; time += config.sceneInterval) {
      await this.createThumbnailAt(time).catch(err => { throw err })
      this.emit('thumbnail-progress', time, duration)
    }
    debug('Creating sprite image')
    await this.createSpriteImage().catch(err => { throw err })
    debug('Finish: ', this.getSpriteImagePath())
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
      ffmpeg(this.getAbsolutePath())
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
          '-qscale:v 5'
        ])
        .on('end', () => {
          resolve()
        })
        .on('error', (err) => {
          debug('Error:', err.message)
          reject(err)
        })
        // .on('stderr', stderr => debug('ffmpeg: ', stderr))
        .save(this.getThumbnailImagePath(time))
    })
  }

  async createSpriteImage() {
    return new Promise(async (resolve, reject) => {
      const metadata = await this.getMetadata()
      const duration = Math.floor(metadata.format.duration)
      const imageCount = Math.ceil(duration / config.sceneInterval)
      const rows = Math.ceil(imageCount / this.spriteImageColumns)
      const baseWidth = this.thumbnailWidth * this.spriteImageColumns
      const baseHeight = this.thumbnailHeight * rows
      new Jimp(baseWidth, baseHeight, async (err, baseImage) => {
        if (err) {
          return reject(err)
        }
        for (let index = 0; index < imageCount; index++) {
          const imagePath = this.getThumbnailImagePath(index * config.sceneInterval)
          const x = 160 * (index % this.spriteImageColumns)
          const y = 90 * Math.floor(index / this.spriteImageColumns)
          try {
            const image = await Jimp.read(imagePath)
            baseImage.blit(image, x, y)
          } catch (err) {
            return reject(err)
          }
        }
        baseImage.quality(70)
        baseImage.write(this.getSpriteImagePath())
        resolve()
      })
    })
  }
}