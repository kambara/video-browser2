const crypto = require('crypto')
const fs = require('fs-extra-promise')
const os = require('os')
const path = require('path')
const config = require('config')
const ffmpeg = require('fluent-ffmpeg')
const Jimp = require('jimp')
const debug = require('debug')('video-browser2:video')
const { Image } = require('image-js')
const kmeans = require('ml-kmeans')
const nearestVector = require('ml-nearest-vector').default
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

  async getThumbnailsCount() {
    if (! await fs.existsAsync(this.getIntervalImagesDirPath()) ) {
      return 0
    }
    const entries = await fs.readdirAsync(this.getIntervalImagesDirPath())
    return entries.filter(entry => !!entry.match(/\.jpg$/)).length
  }

  async toJson() {
    return {
      type: 'video',
      path: this.relativePath,
      thumbnailsDir: await this.getHighlightImagesDirPublicPathIfExist()
    }
  }

  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // Interval images
  //
  getIntervalImagesDirPublicPath() {
    return path.join(
      '/thumbnails',
      this.md5(),
      `interval-${config.sceneInterval}`)
  }

  getIntervalImagesDirPath() {
    return path.join(
      __dirname,
      '../data/thumbnails',
      this.md5(),
      `interval-${config.sceneInterval}`)
  }

  getIntervalImagePath(time) {
    return path.join(this.getIntervalImagesDirPath(), `${time}.jpg`)
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
  // Highlight images
  //
  getHighlightImagesDirPublicPath() {
    return path.join(
      '/thumbnails',
      this.md5(),
      'highlight')
  }

  getHighlightImagesDirPath() {
    return path.join(
      __dirname,
      '../data/thumbnails/',
      this.md5(),
      'highlight')
  }

  async getHighlightImagesDirPublicPathIfExist() {
    return (await fs.existsAsync(this.getHighlightImagesDirPath()))
      ? this.getHighlightImagesDirPublicPath()
      : null
  }

  //
  // Highlight Temp
  //
  getHighlightTempDirPath() {
    return path.join(
      __dirname,
      '../data/thumbnails/',
      this.md5(),
      'highlight-temp')
  }

  getHighlightTempImagePath(time) {
    return path.join(this.getHighlightTempDirPath(), `${time}.jpg`)
  }

  // --------------------------------------------------------------------------
  // Exist thumbnails
  //
  async existThumbnails() {
    // Check sprite image
    if (!await fs.existsAsync(this.getSpriteImagePath())) {
      return false
    }
    // Check highlight images
    if (!await fs.existsAsync(this.getHighlightImagesDirPath())) {
      return false
    }
    const highlightImageFiles = await fs.readdirAsync(this.getHighlightImagesDirPath())
    if (highlightImageFiles.filter(file => file.includes('.jpg')).length < 7) {
      return false
    }
    // Check interval images
    if (!await fs.existsAsync(this.getIntervalImagesDirPath())) {
      return false
    }
    const metadata = await this.getMetadata()
    const duration = Math.floor(metadata.format.duration)
    for (let time = 0; time < duration; time += config.sceneInterval) {
      if (!await fs.existsAsync(this.getIntervalImagePath(time))) {
        return false
      }
    }
    return true
  }

  // --------------------------------------------------------------------------
  // Create thumbnails
  //
  async createThumbnails() {
    debug(`Create thumbnails: ${this.basename()} (${this.md5()})`)
    debug('Creating interval images')
    await this.createIntervalImages().catch(err => { throw err })
    debug('Creating a sprite image')
    await this.createSpriteImage().catch(err => { throw err })
    debug('Creating highlight images')
    await this.createHighlightImages().catch(err => { throw err })
    debug('Finish')
  }

  async createIntervalImages() {
    await fs.mkdirpAsync(this.getIntervalImagesDirPath())
    const metadata = await this.getMetadata()
    const duration = Math.floor(metadata.format.duration)
    for (let time = 0; time < duration; time += config.sceneInterval) {
      await this.createThumbnailAt(
        time,
        this.getIntervalImagePath(time),
        this.thumbnailWidth,
        this.thumbnailHeight
      ).catch(err => { throw err })
      const progress = Math.round(50 * (time / duration))
      this.emit('thumbnail-progress', progress, 100)
    }
  }

  createThumbnailAt(time, file, width, height, pad = true) {
    return new Promise(async (resolve, reject) => {
      if (await fs.existsAsync(file)) {
        return resolve()
      }
      const filters = [{
        filter: 'scale',
        options: [
          `min(trunc(oh*a*sar/2)*2, ${width})`,
          height
        ]
      }]
      if (pad) {
        filters.push({
          filter: 'pad',
          options: [
            width,
            height,
            '(ow-iw)/2',
            '(oh-ih)/2'
          ]
        })
      }
      ffmpeg(this.getAbsolutePath())
        .seekInput(time)
        .inputOptions(`-threads ${config.thumbnailer.threads || 0}`)
        .noAudio()
        .videoFilters(filters)
        .outputOptions([
          '-vframes 1',
          '-vsync 0',
        ])
        .on('end', () => {
          resolve()
        })
        .on('error', (err) => {
          debug('Error:', err.message)
          reject(err)
        })
        // .on('stderr', stderr => debug('  ffmpeg: ', stderr))
        .save(file)
    })
  }

  async createSpriteImage() {
    return new Promise(async (resolve, reject) => {
      if (await fs.existsAsync(this.getSpriteImagePath())) {
        return resolve()
      }
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
          const imagePath = this.getIntervalImagePath(index * config.sceneInterval)
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

  // --------------------------------------------------------------------------
  // Highlight images
  //
  async createHighlightImages() {
    debug('Creating highlight temp images')
    await this.createHighlightTempImages()
    debug('Extract highlight images')
    const images = await this.extractHighlightImages()
    await fs.mkdirpAsync(this.getHighlightImagesDirPath())
    for (let i = 0; i < images.length; i++) {
      const imagePath = path.join(this.getHighlightImagesDirPath(), `${i}.jpg`)
      const image = this.padImage(images[i], this.thumbnailWidth * 2)
      await image.save(imagePath)
    }
    debug('Delete highlight temp images')
    await fs.removeAsync(this.getHighlightTempDirPath())
  }

  padImage(image, width) {
    if (image.width >= width) {
      return image
    }
    return image.pad({
      size: [
        (width - image.width) / 2,
        0
      ],
      algorithm: 'set',
      color: [0, 0, 0, 0]
    })
  }

  async createHighlightTempImages() {
    await fs.mkdirpAsync(this.getHighlightTempDirPath())
    const metadata = await this.getMetadata()
    const duration = Math.floor(metadata.format.duration)
    for (let time = 0; time < duration; time += 5) {
      await this.createThumbnailAt(
        time,
        this.getHighlightTempImagePath(time),
        this.thumbnailWidth * 2,
        this.thumbnailHeight * 2,
        false
      ).catch(err => { throw err })
      const progress = 50 + Math.round(50 * (time / duration))
      this.emit('thumbnail-progress', progress, 100)
    }
  }

  async extractHighlightImages() {
    const files = await fs.readdirAsync(this.getHighlightTempDirPath())
    const images = []
    for (const fileName of files) {
      if (!fileName.match(/\.jpg$/)) continue
      const image = await Image.load(path.join(this.getHighlightTempDirPath(), fileName))
      if (this.isInformativeImage(image)) {
        images.push(image)
      }
    }
    const clusters = this.clusterImages(images)
    const highlightImages = clusters.map(cluster => {
      const centroid = cluster.centroid
      const centroidIndex = nearestVector(cluster.histograms, centroid)
      return cluster.images[centroidIndex]
    })
    return highlightImages
  }

  isInformativeImage(image) {
    const hslImage = image.hsl()
    const lightnessHist = hslImage.getHistogram({
      channel: 2,
      maxSlots: 256,
      useAlpha: false
    })
    const lightnessMaxValue = Math.max.apply(null, lightnessHist)
    const lowValueCount = lightnessHist
      .map(value => 100 * (value/lightnessMaxValue))
      .filter(value => (value <= 1))
      .length
    return (lowValueCount < 80)
  }

  clusterImages(images) {
    const hueHistograms = images.map(image => {
      return image.hsl().getHistogram({
        channel: 0,
        maxSlots: 256,
        useAlpha: false
      })
    })
    const answer = this.iterateKmeans(hueHistograms, 7)
    const clusters = []
    for (let i = 0; i < answer.clusters.length; i++) {
      const clusterId = answer.clusters[i]
      if (!clusters[clusterId]) {
        clusters[clusterId] = {
          centroid: answer.centroids[clusterId].centroid,
          images: [],
          histograms: []
        }
      }
      clusters[clusterId].images.push(images[i])
      clusters[clusterId].histograms.push(hueHistograms[i])
    }
    clusters.sort((a, b) => {
      return b.images.length - a.images.length
    })
    return clusters
  }

  iterateKmeans(histograms, k) {
    let bestAnswer = null
    let minErrorCount = 0
    for (let i = 0; i < 10; i++) {
      const answer = kmeans(histograms, k)
      const errorCount = answer.centroids
        .reduce((total, centroid) => {
          return total + centroid.error
        }, 0)
      if (i === 0 || errorCount < minErrorCount) {
        minErrorCount = errorCount
        bestAnswer = answer
      }
    }
    return bestAnswer
  }
}