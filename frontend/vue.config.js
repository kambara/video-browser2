module.exports = {
  outputDir: '../backend/public',
  devServer: {
    proxy: {
      '/ws/': {
        target: 'ws://localhost:3000',
        ws: true,
        changeOrigin: true
      },
      '/api/': {
        target: 'http://localhost:3000'
      },
      '/thumbnails/': {
        target: 'http://localhost:3000'
      }
    }
  }
}