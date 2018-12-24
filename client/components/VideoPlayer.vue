<template lang="pug">
.video-container(@mousemove="onVideoMouseMove")
  video(
    ref="video"
    type="video/mp4"
    :src="src"
    :autoplay="autoPlay"
    @canplay="onVideoCanPlay"
    @loadstart="onVideoLoadStart"
    @playing="onVideoPlaying"
    @pause="onVideoPause"
    @ended="onVideoEnded"
  )
  transition(name="fade")
    .controls(v-if="controlVisibility")
      input.seek-bar(
        type="range"
        :value="currentTimeSec"
        :max="$store.state.video.duration"
        @input="onSeekBarInput"
        @change="onSeekBarChange"
        @click.stop
      )
      .bottom
        .left
          button.play-button(
            :disabled="!loaded"
            @click.stop="onPlayButtonClick"
          )
            i.material-icons {{ paused ? 'play_arrow' : 'pause' }}
          input.volume(
            type="range"
            max="1"
            step="0.01"
            :value="volume"
            @input="onVolumeInput"
            @click.stop
          )
          span.time
            | {{ formatTime(currentTimeSec) }}
            | /
            | {{ formatTime($store.state.video.duration) }}
        .right
          button(@click.stop="onPlayerModeButtonClick" v-if="!fullscreen")
            i.material-icons view_comfy
          button(@click.stop="onFullscreenButtonClick")
            i.material-icons
              | {{ fullscreen ? 'fullscreen_exit' : 'fullscreen' }}
</template>

<script>
import Vue from 'vue'
import Vuex from 'vuex'
import VueCookies from 'vue-cookies'
import VideoUtil from '../mixins/VideoUtil'

Vue.use(Vuex)
Vue.use(VueCookies)

export default {
  mixins: [VideoUtil],
  data() {
    return {
      loaded_: false,
      paused_: true,
      autoPlay: true,
      currentTime: 0,
      controlVisibility: true,
      fullscreen: false,
      volume: 0.5,
    }
  },
  computed: {
    loaded: function() {
      return this.loaded_
    },
    paused() {
      return this.paused_
    },
    src() {
      const path = this.$route.params.pathMatch
      const sec = Math.floor(this.$store.state.video.startTime / 1000)
      return `/api/video/stream/${path}?time=${sec}`
    },
    currentTimeSec() {
      return Math.floor(this.currentTime / 1000)
    },
  },
  watch: {
    volume() {
      if (this.$refs.video) {
        const vol = this.volume * this.volume
        this.$refs.video.volume = vol
      }
      this.$cookies.set('volume', this.volume, '1Y')
    },
    '$store.state.video.startTime': function() {
      this.currentTime = this.$store.state.video.startTime
    }
  },
  created: async function() {
    this.intervalIdOfUpdateTime = setInterval(() => {
      this.updateTime()
    }, 100)
    const vol = this.$cookies.get('volume')
    if (vol != null) {
      this.volume = vol
    }
  },
  mounted() {
    this.hideControlLater()
    window.addEventListener('keydown', this.onKeydown)
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.onKeydown)
    clearInterval(this.intervalIdOfUpdateTime)
    this.pause()
    if (this.$refs.video) {
      this.$refs.video.removeAttribute('src')
      this.$refs.video.load()
    }
  },
  methods: {
    play() {
      if (this.$refs.video) {
        this.$refs.video.play()
      }
    },
    pause() {
      if (this.$refs.video) {
        this.$refs.video.pause()
      }
    },
    togglePlay() {
      if (this.paused) {
        this.play()
      } else {
        this.pause()
      }
    },
    updateTime() {
      if (this.$refs.video && !this.paused && this.lastTime) {
        this.currentTime += Date.now() - this.lastTime
      }
      this.lastTime = Date.now()
    },
    //
    // Video event
    //
    onVideoLoadStart() {
      this.loaded_ = false
    },
    onVideoCanPlay() {
      this.loaded_ = true
    },
    onVideoPause(event) {
      this.paused_ = event.currentTarget.paused
    },
    onVideoPlaying(event) {
      this.paused_ = event.currentTarget.paused
    },
    onVideoEnded () {
      this.pause()
    },
    onVideoMouseMove () {
      this.showAndHideControlLater()
    },
    showControl() {
      this.controlVisibility = true
      if (this.timeoutIdOfHideControl) {
        clearTimeout(this.timeoutIdOfHideControl)
      }
    },
    hideControlLater() {
      this.timeoutIdOfHideControl = setTimeout(() => {
        this.controlVisibility = false
      }, 4 * 1000)
    },
    showAndHideControlLater() {
      this.showControl()
      if (!this.paused) {
        this.hideControlLater()
      }
    },
    //
    // Seek bar
    //
    onSeekBarInput (event) {
      if (!this.seeking) {
        this.seeking = true
        if (this.loaded) {
          this.autoPlay = !this.paused
        }
        this.pause()
      }
      this.currentTime = event.currentTarget.value * 1000
    },
    onSeekBarChange (event) {
      this.currentTime = event.currentTarget.value * 1000
      this.$store.dispatch('startVideoAt', this.currentTime)
      this.seeking = false
    },
    //
    // Play button
    //
    onPlayButtonClick (event) {
      this.togglePlay()
      event.currentTarget.blur()
    },
    //
    // Volume
    //
    onVolumeInput (event) {
      this.volume = event.currentTarget.value
    },
    //
    // Fullscreen
    //
    onFullscreenButtonClick(event) {
      this.toggleFullscreen()
      event.currentTarget.blur()
    },
    toggleFullscreen () {
      if (document.webkitFullscreenElement) {
        document.webkitExitFullscreen()
        this.fullscreen = false
      } else {
        document.querySelector('.video-container')
          .webkitRequestFullscreen()
        this.fullscreen = true
      }
    },
    //
    // PlayerMode
    //
    onPlayerModeButtonClick(event) {
      this.$store.dispatch('togglePlayerMode')
      event.currentTarget.blur()
    },
    //
    // Keyboard event
    //
    onKeydown(event) {
      if (event.metaKey || event.ctrlKey) return
      switch(event.key) {
      case ' ':
        if (!event.repeat) {
          this.togglePlay()
        }
        break
      case 'f':
        if (!event.repeat) {
          this.toggleFullscreen()
        }
        break
      case 'v':
        if (!event.repeat) {
          this.$store.dispatch('togglePlayerMode')
        }
        break
      case 'ArrowRight':
        this.$store.dispatch('startVideoAt', this.currentTime + 10 * 1000)
        this.showAndHideControlLater()
        break
      case 'ArrowLeft':
        this.$store.dispatch('startVideoAt', this.currentTime - 10 * 1000)
        this.showAndHideControlLater()
        break
      case 'ArrowUp':
        this.$store.dispatch('startVideoAt', this.currentTime + 60 * 1000)
        this.showAndHideControlLater()
        break
      case 'ArrowDown':
        this.$store.dispatch('startVideoAt', this.currentTime - 60 * 1000)
        this.showAndHideControlLater()
        break
      }
    },
  }
}
</script>

<style lang="stylus" scoped>
.fade-enter-active, .fade-leave-active
  transition opacity .5s

.fade-enter, .fade-leave-to
  opacity 0

.video-container
  position relative
  width 100%
  height 100%

  video
    display block
    width 100%
    height 100%
    background-color black

  .controls
    position absolute
    bottom 0px
    width 100%
    padding 8px
    box-sizing border-box

    .bottom
      display flex

      .left
        margin-right auto

    input[type="range"]
      -webkit-appearance none
      height 1px
      box-sizing border-box
      border-radius 3px
      background-color rgba(255, 255, 255, 0.6)
      outline 0
      cursor pointer
      filter drop-shadow(0 0px 1px rgba(0, 0, 0, .9))

      &::-webkit-slider-thumb
        -webkit-appearance none
        position relative
        display block
        width 11px
        height 11px
        border-radius 50%
        background-color white
        cursor pointer

      &:active::-webkit-slider-thumb
        box-shadow: 0 0 0 4px rgba(0, 0, 0, .6)

      &.seek-bar
        display block
        width 100%
        margin-bottom 12px

      &.volume
        display inline-block
        width 80px
        margin 0px 16px 0 8px
        vertical-align middle

    button
      display inline-block
      width 64px
      height 40px
      background-color rgba(0, 0, 0, 0)
      filter drop-shadow(0 0px 1px rgba(0, 0, 0, .9))
      border none
      outline 0
      color white
      vertical-align middle
      cursor pointer

      &:hover
        background-color rgba(0, 0, 0, .6)
        color #34c6ff
        transition: .3s

      &[disabled]
        opacity 0.5

      &.play-button
        width 80px

    .time
      font-size 12px
      font-weight 100
      color rgba(255, 255, 255, 0.9)
      filter drop-shadow(0 0px 1px rgba(0, 0, 0, .9))
      cursor default
</style>