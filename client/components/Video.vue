<template lang="pug">
div(@mousemove="onMouseMove" @wheel="onWheel")
  transition(name="fade")
    nav(v-if="isNavigationVisible")
      router-link.back-button(:to="linkToParentList(path)")
        i.fas.fa-arrow-left
  .video-player-container(
    :class="{ pip: isPictureInPicture }"
    @click="onVideoPlayerContainerClick"
    )
    video-player
  .video-info-container
    .header
      h1 {{ basename(path) }}
      button(@click="onCreateThumbnailsButtonClick")
        | Create Thumbnails
    scene-list
  thumbnailer-progress
</template>

<script>
import Vue from 'vue'
import Vuex from 'vuex'
import VideoPlayer from './VideoPlayer'
import SceneList from './SceneList'
import ThumbnailerProgress from './ThumbnailerProgress'
import VideoPath from '../mixins/VideoPath'
import { ViewMode } from '../enum.js'

Vue.use(Vuex)

export default {
  mixins: [VideoPath],
  props: ['path'],
  data() {
    return {
      isNavigationVisible: true,
      hideNavigationTimeoutId: null,
      wheelDistance: 0,
      lastWheelTime: 0,
    }
  },
  computed: {
    isPictureInPicture() {
      return (this.$store.state.video.viewMode === ViewMode.SCENE_LIST)
    },
  },
  created() {
    this.$store.dispatch('initVideo', this.path)
    this.hideNavigationLater()
  },
  methods: {
    async onCreateThumbnailsButtonClick () {
      const response = await fetch(`/api/video/thumbnails/create/${this.path}`)
      const json = await response.json()
      console.log(json)
    },
    onMouseMove() {
      this.showNavigation()
      this.hideNavigationLater()
    },
    onWheel(event) {
      if (new Date().getTime() - this.lastWheelTime > 500) {
        this.wheelDistance = 0
      }
      this.wheelDistance += Math.abs(event.deltaY)
      // console.log(this.wheelDistance)
      if (this.wheelDistance > 500) {
        this.$store.dispatch('switchToSceneListMode')
        this.wheelDistance = 0
      }
      this.lastWheelTime = new Date().getTime()
    },
    onVideoPlayerContainerClick() {
      this.$store.dispatch('switchToPlayerMode')
    },
    showNavigation() {
      if (this.hideNavigationTimeoutId != null) {
        clearTimeout(this.hideNavigationTimeoutId)
      }
      this.isNavigationVisible = true
    },
    hideNavigationLater() {
      this.hideNavigationTimeoutId = setTimeout(() => {
        this.isNavigationVisible = false
      }, 4 * 1000)
    },
  },
  components: {
    VideoPlayer,
    SceneList,
    ThumbnailerProgress,
  },
}
</script>

<style lang="stylus" scoped>
.fade-enter-active, .fade-leave-active
  transition opacity .5s

.fade-enter, .fade-leave-to
  opacity 0

.pip
  transition width,height .5s
  width 0%
  height 0%

nav
  position fixed
  z-index 3
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

.video-player-container
  transition-property width, height
  transition-duration 1.2s
  transition-timing-function ease
  position fixed
  z-index 2
  min-width 400px
  min-height 225px
  width 100%
  height 100%
  box-shadow 0 5px 10px rgba(0, 0, 0, .6)

  &.pip
    width 0%
    height 0%

.video-info-container
  width 100%
  height 100vh
  overflow scroll

  .header
    padding-top 225px

    h1
      padding 0
      margin 16px
      font-size 18px
      font-weight normal
</style>