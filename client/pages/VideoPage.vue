<template lang="pug">
div(@mousemove="onMouseMove" @wheel="onWheel")
  transition(name="fade")
    nav(v-if="navigationVisibility")
      .left
        router-link.back-button(:to="linkToParentList(path)")
          i.material-icons arrow_back
        h1 {{ basename(path) }}
      .right
        button(@click="onDownloadButtonClick")
          | Download
        button(@click="onRandomButtonClick")
          | Random
        button(@click="onCreateThumbnailsButtonClick")
          | Create Thumbnails
  .video-player-and-scene-list-container
    .video-player-container(
      :class="[playerSizeClass]"
      @click="onVideoPlayerContainerClick"
    )
      video-player
    .scene-list-container(
      ref="sceneListContainer"
      :class="[playerSizeClass]"
      @scroll="onSceneListScroll"
    )
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
import { PlayerMode } from '../enums/enum.js'

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
    playerSizeClass() {
      switch(this.$store.state.video.playerMode) {
      case PlayerMode.SMALL:
        return 'player-small'
      case PlayerMode.MIDDLE:
        return 'player-middle'
      case PlayerMode.LARGE:
        return 'player-large'
      }
    }
  },
  watch: {
    '$store.state.video.playerMode': function() {
      if (this.$store.state.video.playerMode !== PlayerMode.LARGE) {
        this.$refs.sceneListContainer.focus()
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
      if (this.$store.state.video.playerMode === PlayerMode.SMALL) {
        this.$store.dispatch('switchToMiddleMode')
      }
    },
    onDownloadButtonClick() {
      const link = document.createElement('a')
      link.href = `/api/video/download/${this.path}`
      link.click()
    },
    //
    // Mouse move event
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
      if (this.$store.state.video.playerMode !== PlayerMode.LARGE) return
      if (!this.lastWheelTime) {
        this.lastWheelTime = Date.now()
      }
      if (!this.wheelDistance) {
        this.wheelDistance = 0
      }
      if (Date.now() - this.lastWheelTime > 500) {
        this.wheelDistance = 0
      }
      this.wheelDistance += event.deltaY
      console.log(this.wheelDistance)
      if (Math.abs(this.wheelDistance) > 300) {
        this.$store.dispatch('switchToMiddleMode')
        this.wheelDistance = 0
      }
      this.lastWheelTime = Date.now()
    },
    //
    // Scroll event
    //
    onSceneListScroll(event) {
      if (this.$store.state.video.playerMode !== PlayerMode.MIDDLE) return
      if (!this.lastScrollTime) {
        this.lastScrollTime = Date.now()
      }
      if (this.scrollStartPosition === undefined) {
        this.scrollStartPosition = 0
      }
      if (Date.now() - this.lastScrollTime > 500) {
        this.scrollStartPosition = event.currentTarget.scrollTop
      }
      this.scrollDistance =
        event.currentTarget.scrollTop - this.scrollStartPosition
      console.log(this.scrollDistance)
      if (Math.abs(this.scrollDistance) > 500) {
        console.log('switchToSmallMode')
        this.$store.dispatch('switchToSmallMode')
        this.scrollStartPosition = event.currentTarget.scrollTop
      }
      this.lastScrollTime = Date.now()
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
  display flex
  width 100%
  box-sizing border-box
  padding 8px
  filter drop-shadow(0 0 1px rgba(0, 0, 0, .9))

  .left
    flex 1 0
    white-space nowrap
    overflow hidden
    text-overflow ellipsis
    height = 40px

    .back-button
      display inline-block
      width 48px
      height height
      line-height height
      text-align center
      font-size 18px
      color rgba(255, 255, 255, 0.9)

      &:hover
        color #34c6ff
        background-color rgba(0, 0, 0, 0.6)
        transition: .4s

      i
        vertical-align middle

    h1
      display inline-block
      margin 0
      margin-left 8px
      padding 0
      height height
      line-height height
      font-size 14px
      letter-spacing 0.03em
      font-weight normal
      color rgba(255, 255, 255, 0.9)

  .right
    width 340px
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

.video-player-and-scene-list-container
  display flex
  flex-direction column
  position fixed
  display flex
  width 100%
  height 100%

  .video-player-container
    transition-property all
    transition-duration 1.2s
    position relative
    z-index 2
    box-shadow 0 3px 6px rgba(0, 0, 0, .5)
    width 100%

    &.player-large
      height 100%
      flex 1

    &.player-middle
      height 180px

      @media (min-height 440px)
        height 270px

      @media (min-height 560px)
        height 360px

      @media (min-height 630px)
        height 450px // Tablet

      @media (min-height 800px)
        height 540px

      @media (min-height 920px)
        height 630px

      @media (min-height 1040px)
        height 720px

      @media (min-height 1280px)
        height 900px

      @media (min-height 1400px)
        height 1080px

    &.player-small
      height 90px

      @media (min-height 520px)
        height 180px

      @media (min-height 920px)
        height 270px

      @media (min-height 1400px)
        height 360px

  .scene-list-container
    overflow scroll
    transition-property all
    transition-duration 1.2s
    z-index 1
    background-color #333

    &.player-large
      height 0

    &.player-middle
      flex 1

    &.player-small
      flex 1

</style>