const fs = require('fs')
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

  getEntries(callback) {
    fs.readdir(this.getAbsolutePath(), (err, entries) => {
      entries = entries.filter(entry => {
        // Exclude dotfiles
        return !path.basename(entry).match(/^\./)
      })
      callback(err, entries)
    })
  }

  getEntriesJson(callback) {
    this.getEntries((err, entries) => {
      const json = []
      for (const entry of entries) {
        const entryRelativePath = path.join(this.relativePath, entry)
        const entryPath = path.join(this.getAbsolutePath(), entry)
        const stat = fs.statSync(entryPath)
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
          const firstVideoRelPath = dir.findFirstVideo()
          if (firstVideoRelPath) {
            const video = new Video(firstVideoRelPath)
            item.allScenesImagePath = video.getAllScenesImagePublicPath()
            item.thumbnailsDirPath = video.getThumbnailsDirPublicPath()
            item.thumbnailsCount = video.getThumbnailsCount()
          }
          json.push(item)
        } else if (this.isVideo(entryRelativePath)) {
          const video = new Video(entryRelativePath)
          json.push({
            type: 'file',
            path: video.relativePath,
            allScenesImagePath: video.getAllScenesImagePublicPath(),
            thumbnailsDirPath: video.getThumbnailsDirPublicPath(),
            thumbnailsCount: video.getThumbnailsCount(),
            sceneInterval: config.sceneInterval
          })
        }
      }
      callback(err, json)
    })
  }

  findFirstVideo() {
    // Find video file
    const videoFileName = fs.readdirSync(this.getAbsolutePath())
      .find(entry => this.isVideo(entry))
    if (videoFileName) {
      return path.join(this.relativePath, videoFileName)
    }
    // Find sub directories
    const subDirs = fs.readdirSync(this.getAbsolutePath())
      .filter(entry => {
        const entryPath = path.join(this.getAbsolutePath(), entry)
        return fs.statSync(entryPath).isDirectory()
      })
    for (const dir of subDirs) {
      const relPath = path.join(this.relativePath, dir)
      const videoDir = new VideoDir(relPath)
      const videoPath = videoDir.findFirstVideo()
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