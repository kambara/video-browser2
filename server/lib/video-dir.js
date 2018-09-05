const fs = require('fs-extra-promise')
const path = require('path')
const Entry = require('./entry')
const Video = require('./video')

module.exports = class VideoDir extends Entry {
  constructor(relativePath) {
    super(relativePath)
  }

  async getEntries() {
    const entries = (await fs.readdirAsync(this.getAbsolutePath()))
      .filter(entry => !path.basename(entry).match(/^\./))
      .map(entry => new Entry(path.join(this.relativePath, entry)))
    const results = []
    for (const entry of entries) {
      const stats = await fs.statAsync(entry.getAbsolutePath())
      if (stats.isDirectory()) {
        results.push(new VideoDir(entry.relativePath))
      } else if (this.isVideo(entry.basename())) {
        results.push(new Video(entry.relativePath))
      }
    }
    return results
  }

  async getVideos() {
    return (await this.getEntries())
      .filter(entry => entry instanceof Video)
  }

  async getSubDirs() {
    return (await this.getEntries())
      .filter(entry => entry instanceof VideoDir)
  }

  async getVideosRecursive() {
    let videos = []
    for (const entry of await this.getEntries()) {
      if (entry instanceof Video) {
        videos.push(entry)
      } else if (entry instanceof VideoDir) {
        videos = videos.concat(await entry.getVideosRecursive())
      }
    }
    return videos
  }

  async searchEntries(query) {
    let entries = []
    for (const entry of await this.getEntries()) {
      if (entry.match(query)) {
        entries.push(entry)
      }
      if (entry instanceof VideoDir) {
        entries = entries.concat(await entry.searchEntries(query))
      }
    }
    return entries
  }

  async toJson() {
    const firstVideo = await this.findFirstVideo()
    return {
      type: 'directory',
      path: this.relativePath,
      thumbnails: firstVideo ? await firstVideo.getThumbnailsInfo() : null
    }
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

  async getRandomVideo() {
    const videos = await this.getVideosRecursive()
    if (videos.length === 0) {
      return null
    }
    const index = Math.floor(videos.length * Math.random())
    return videos[index]
  }

  isVideo(entry) {
    return !!entry.match(
      /\.(mp4|m4v|mkv|mov|avi|asf|wmv|mpg|mpeg|webm|flv|ts|m2ts)$/i
    )
  }
}