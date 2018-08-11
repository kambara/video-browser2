const VideoUtil = {
  methods: {
    basename: function(path) {
      const elements = path.split('/')
      if (elements.length === 1) {
        return elements[0]
      }
      const fileName = elements.pop()
      if (fileName.length > 0) {
        return fileName
      }
      return elements.pop()
    }
  }
}

const TestMixin = {
  methods: {
    hoge: function() {
      console.log('hoge')
    }
  }
}