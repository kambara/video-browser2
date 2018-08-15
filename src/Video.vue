<template>
  <div>
    <video-player :path="path"></video-player>
    <h2>{{ basename(path) }}</h2>
    <button @click="onGenerateThumbnailsButtonClick">
      Generate Thumbnails
    </button>
    <thumbnails-list :path="path"></thumbnails-list>
  </div>
</template>

<script>
import VideoPlayer from './VideoPlayer'
import ThumbnailsList from './ThumbnailsList'
import VideoUtil from './VideoUtil'

export default {
  data: function () {
    return {
      path: this.$route.params[0] || ''
    }
  },
  components: {
    VideoPlayer: VideoPlayer,
    ThumbnailsList: ThumbnailsList
  },
  created: function() {
    
  },
  mixins: [VideoUtil],
  methods: {
    onGenerateThumbnailsButtonClick: async function(event) {
      console.log('gen thumb')
      const response = await fetch(`/api/generate-thumbnails/${this.path}`)
      const json = await response.json()
      console.log(json)
    }
  }
}
</script>

<style scoped>
  h2 {
    padding: 0;
    margin: 16px;
    font-size: 18px;
    font-weight: normal;
  }
</style>