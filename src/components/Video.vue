<template lang="pug">
div
  video-player
  h2 {{ basename(path) }}
  button(@click='onGenerateThumbnailsButtonClick')
    | Generate Thumbnails
  scene-list
</template>

<script>
import Vue from 'vue'
import Vuex from 'vuex'
import VideoPlayer from './VideoPlayer'
import SceneList from './SceneList'
import VideoUtil from './VideoUtil'

Vue.use(Vuex)

export default {
  data: function () {
    return {
      path: this.$route.params[0] || ''
    }
  },
  components: {
    VideoPlayer: VideoPlayer,
    SceneList: SceneList
  },
  created: function() {
    this.$store.dispatch('initVideo', this.path)
  },
  mixins: [VideoUtil],
  methods: {
    onGenerateThumbnailsButtonClick: async function() {
      const response = await fetch(`/api/generate-thumbnails/${this.path}`)
      const json = await response.json()
      console.log(json)
    }
  }
}
</script>

<style lang="stylus" scoped>
h2
  padding 0
  margin 16px
  font-size 18px
  font-weight normal
</style>