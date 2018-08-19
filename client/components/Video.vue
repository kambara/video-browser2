<template lang="pug">
div(@mousemove="onMouseMove")
  transition(name="fade")
    nav(v-if="isNavigationVisible")
      router-link.back-button(:to="linkToParentList(path)")
        i.fas.fa-arrow-left
  video-player
  h2 {{ basename(path) }}
  button(@click="onGenerateThumbnailsButtonClick")
    | Generate Thumbnails
  scene-list
</template>

<script>
import Vue from 'vue'
import Vuex from 'vuex'
import VideoPlayer from './VideoPlayer'
import SceneList from './SceneList'
import VideoUtil from '../mixins/VideoUtil'

Vue.use(Vuex)

export default {
  mixins: [VideoUtil],
  props: ['path'],
  data () {
    return {
      isNavigationVisible: true,
      hideNavigationTimeoutId: null,
    }
  },
  created () {
    this.$store.dispatch('initVideo', this.path)
    this.hideNavigationLater()
  },
  methods: {
    async onGenerateThumbnailsButtonClick () {
      const response = await fetch(`/api/generate-thumbnails/${this.path}`)
      const json = await response.json()
      console.log(json)
    },
    onMouseMove () {
      this.showNavigation()
      this.hideNavigationLater()
    },
    showNavigation () {
      if (this.hideNavigationTimeoutId != null) {
        clearTimeout(this.hideNavigationTimeoutId)
      }
      this.isNavigationVisible = true
    },
    hideNavigationLater () {
      this.hideNavigationTimeoutId = setTimeout(() => {
        this.isNavigationVisible = false
      }, 4 * 1000)
    },
  },
  components: {
    VideoPlayer,
    SceneList,
  },
}
</script>

<style lang="stylus" scoped>
.fade-enter-active, .fade-leave-active
  transition opacity .5s

.fade-enter, .fade-leave-to
  opacity 0

nav
  position fixed
  z-index 2
  padding 16px 0
  font-size 20px

  .back-button
    display inline-block
    width 32px
    height 32px
    margin-left 8px
    line-height 32px
    text-align center
    border-radius 6px

    &:hover
      background-color rgba(0, 0, 0, 0.5)

h2
  padding 0
  margin 16px
  font-size 18px
  font-weight normal
</style>