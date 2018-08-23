const fs = require('fs-extra-promise')
const path = require('path')
const config = require('config')
const Video = require('./video')

module.exports = class VideoDir {
  constructor(relativePath) {
    this.relativePath = relativePath
  }

  getAbsolutePath() {
    return path.join(config.videoRoot, this.relativePath)
  }

  async getEntries() {
    const entries = await fs.readdirAsync(this.getAbsolutePath())
    return entries.filter(entry => {
      // Exclude dotfiles
      return !path.basename(entry).match(/^\./)
    })
  }

  async getEntriesJson() {
    const entries = await this.getEntries()
    const json = []
    for (const entry of entries) {
      const entryRelativePath = path.join(this.relativePath, entry)
      const entryPath = path.join(this.getAbsolutePath(), entry)
      const stat = await fs.statAsync(entryPath)
      if (stat.isDirectory()) {
        const dir = new VideoDir(entryRelativePath)
        const item = {
          type: 'directory',
          path: dir.relativePath,
          allScenesImagePath: '',
          thumbnailsDirPath: '',
          thumbnailsCount: 0,
          sceneInterval: config.sceneInterval
        }
        const firstVideoRelPath = await dir.findFirstVideo()
        if (firstVideoRelPath) {
          const video = new Video(firstVideoRelPath)
          item.allScenesImagePath = video.getAllScenesImagePublicPath()
          item.thumbnailsDirPath = video.getThumbnailsDirPublicPath()
          item.thumbnailsCount = await video.getThumbnailsCount()
        }
        json.push(item)
      } else if (this.isVideo(entryRelativePath)) {
        const video = new Video(entryRelativePath)
        json.push({
          type: 'file',
          path: video.relativePath,
          allScenesImagePath: video.getAllScenesImagePublicPath(),
          thumbnailsDirPath: video.getThumbnailsDirPublicPath(),
          thumbnailsCount: await video.getThumbnailsCount(),
          sceneInterval: config.sceneInterval
        })
      }
    }
    return json
  }

  async findFirstVideo() {
    // Find video file
    const entries = await this.getEntries()
    const videoFileName = entries.find(entry => this.isVideo(entry))
    if (videoFileName) {
      return path.join(this.relativePath, videoFileName)
    }
    // Find sub directories
    const subDirs = entries.filter(async entry => {
      const entryPath = path.join(this.getAbsolutePath(), entry)
      const stats = await fs.statAsync(entryPath)
      return stats.isDirectory()
    })
    for (const dir of subDirs) {
      const videoDir = new VideoDir(path.join(this.relativePath, dir))
      const videoPath = await videoDir.findFirstVideo()
      if (videoPath) {
        return videoPath
      }
    }
    return null
  }

  isVideo(entry) {
    return !!entry.match(
      /\.(mp4|m4v|mkv|mov|avi|asf|wmv|mpg|mpeg|webm|flv|ts|m2ts)$/i
    )
  }
}