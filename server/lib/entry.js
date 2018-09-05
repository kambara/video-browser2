const EventEmitter = require('events')
const path = require('path')
const config = require('config')

module.exports = class Entry extends EventEmitter {
  constructor(relativePath) {
    super()
    this.relativePath = relativePath
  }

  getAbsolutePath() {
    return path.join(config.videoRoot, this.relativePath)
  }

  basename() {
    return path.basename(this.relativePath)
  }

  match(query) {
    return this.basename().normalize().match(new RegExp(query, 'i'))
  }

  async toJson() {
    throw new Error('Not Implemented')
  }
}