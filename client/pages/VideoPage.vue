<template lang="pug">
div(@mousemove="onMouseMove" @wheel="onWheel")
  transition(name="fade")
    nav(v-if="navigationVisibility")
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
      button(@click="onRandomButtonClick")
        | Random
      button(@click="onCreateThumbnailsButtonClick")
        | Create Thumbnails
    scene-list
  thumbnailer-progress
</template>

<script>
import Vue from 'vue'
import Vuex from 'vuex'
import VideoPlayer from '../components/VideoPlayer'
import SceneList from '../components/SceneList'
import ThumbnailerProgress from '../components/ThumbnailerProgress'
import VideoPath from '../mixins/VideoPath'
import { ViewMode } from '../enums/enum.js'

Vue.use(Vuex)

export default {
  mixins: [VideoPath],
  data() {
    return {
      navigationVisibility: true
    }
  },
  computed: {
    path() {
      return this.$route.params[0] || ''
    },
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
    this.$store.dispatch('initVideo', this.path)
  },
  mounted() {
    this.hideNavigationLater()
    window.addEventListener('keydown', this.onKeydown)
  },
  methods: {
    async onCreateThumbnailsButtonClick () {
      const response = await fetch(
        `/api/video/thumbnails/create/${this.path}`,
        { method: 'POST' })
      const json = await response.json()
      console.log(json)
    },
    //
    // Button event
    //
    onRandomButtonClick() {
      this.$router.push('/random')
    },
    onVideoPlayerContainerClick() {
      this.$store.dispatch('switchToPlayerMode')
    },
    //
    // Mouse event
    //
    onMouseMove() {
      this.showNavigation()
      this.hideNavigationLater()
    },
    showNavigation() {
      if (this.timeoutIdOfHideNavigation) {
        clearTimeout(this.timeoutIdOfHideNavigation)
      }
      this.navigationVisibility = true
    },
    hideNavigationLater() {
      this.timeoutIdOfHideNavigation = setTimeout(() => {
        this.navigationVisibility = false
      }, 4 * 1000)
    },
    //
    // Wheel event
    //
    onWheel(event) {
      if (!this.lastWheelTime) {
        this.lastWheelTime = new Date().getTime()
      }
      if (!this.wheelDistance) {
        this.wheelDistance = 0
      }
      if (new Date().getTime() - this.lastWheelTime > 500) {
        this.wheelDistance = 0
      }
      this.wheelDistance += Math.abs(event.deltaY)
      if (this.wheelDistance > 500) {
        this.$store.dispatch('switchToSceneListMode')
        this.wheelDistance = 0
      }
      this.lastWheelTime = new Date().getTime()
    },
    //
    // Keyboard event
    //
    onKeydown(event) {
      if (event.metaKey || event.ctrlKey) return
      switch(event.key) {
      case 'r':
        this.$router.push('/random')
        break
      }
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