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

  async getVideos() {
    const entries = await this.getEntries()
    return entries
      .filter(entry => this.isVideo(entry))
      .map(entry => new Video(path.join(this.relativePath, entry)))
  }

  async getSubDirs() {
    const subDirs = []
    for (const entry of await this.getEntries()) {
      const entryPath = path.join(this.getAbsolutePath(), entry)
      const stats = await fs.statAsync(entryPath)
      if (stats.isDirectory()) {
        subDirs.push(
          new VideoDir(path.join(this.relativePath, entry))
        )
      }
    }
    return subDirs
  }

  async getVideosRecursive() {
    let videos = await this.getVideos()
    for (const videoDir of await this.getSubDirs()) {
      const subDirVideos = await videoDir.getVideosRecursive()
      videos = videos.concat(subDirVideos)
    }
    return videos
  }

  async getEntries() {
    const entries = await fs.readdirAsync(this.getAbsolutePath())
    return entries.filter(entry => !path.basename(entry).match(/^\./))
  }

  async getEntriesInfo() {
    const entries = await this.getEntries()
    const entryList = []
    for (const entry of entries) {
      const entryRelativePath = path.join(this.relativePath, entry)
      const stat = await fs.statAsync(path.join(this.getAbsolutePath(), entry))
      if (stat.isDirectory()) {
        const dir = new VideoDir(entryRelativePath)
        const firstVideo = await dir.findFirstVideo()
        entryList.push({
          type: 'directory',
          path: dir.relativePath,
          thumbnails: firstVideo ? await firstVideo.getThumbnailsInfo() : null
        })
      } else if (this.isVideo(entryRelativePath)) {
        const video = new Video(entryRelativePath)
        entryList.push({
          type: 'video',
          path: video.relativePath,
          thumbnails: await video.getThumbnailsInfo()
        })
      }
    }
    return entryList
  }

  async findFirstVideo() {
    // Find video file
    const videos = await this.getVideos()
    if (videos.length > 0) {
      return videos[0]
    }
    // Find sub directories
    for (const videoDir of await this.getSubDirs()) {
      const video = await videoDir.findFirstVideo()
      if (video) {
        return video
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