<template lang="pug">
div(@mousemove="onMouseMove" @wheel="onWheel")
  transition(name="fade")
    nav(v-if="isNavigationVisible")
      router-link.back-button(:to="linkToParentList(path)")
        i.material-icons arrow_back
      h1 {{ basename(path) }}
  .video-player-container(
    :class="{ pip: isPictureInPicture }"
    @click="onVideoPlayerContainerClick"
  )
    video-player
  .video-info-container(ref="videoInfoContainer")
    .header
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
  watch: {
    '$store.state.video.viewMode': function() {
      if (this.$store.state.video.viewMode === ViewMode.SCENE_LIST) {
        this.$refs.videoInfoContainer.focus()
      }
    },
  },
  created() {
    this.$store.dispatch('startVideo', this.path)
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
      }, 4 * 100 * 1000)
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

nav
  position fixed
  z-index 3
  margin 8px
  filter drop-shadow(0 0 1px rgba(0, 0, 0, .9))

  .back-button
    display inline-block
    width 48px
    height 40px
    line-height 40px
    text-align center
    font-size 18px

    &:hover
      background-color rgba(0, 0, 0, 0.6)
      transition: .4s

    i
      vertical-align middle

  h1
    display inline-block
    margin 0
    margin-left 8px
    padding 0
    height 40px
    line-height 40px
    font-size 14px
    letter-spacing 0.03em
    font-weight normal

.video-player-container
  transition-property all
  transition-duration 1.2s
  position fixed
  z-index 2
  min-width 400px
  min-height 225px
  width 100%
  height 100%
  bottom 0px
  right 0px
  box-shadow 0 5px 10px rgba(0, 0, 0, .6)

  &.pip
    width 0%
    height 0%

.video-info-container
  width 100%
  height 100vh
  overflow scroll

  .header
    margin 16px
    box-sizing border-box
    text-align right
    
    button
      height 32px
      padding 0 16px
      line-height 32px
      background-color rgba(0, 0, 0, 0)
      border none
      color rgba(255, 255, 255, 0.5)
      font-size 12px
      cursor pointer

      &:hover
        background-color #333
        color rgba(255, 255, 255, .9)

      i
        vertical-align middle
</style>