<template lang="pug">
.video-container(@mousemove="onVideoMouseMove")
  video(
    ref="video"
    type="video/mp4"
    :src="$store.getters.src"
    :autoplay="autoPlay"
    @canplay="onVideoCanPlay"
    @loadstart="onVideoLoadStart"
    @playing="onVideoPause"
    @pause="onVideoPause"
    @ended="onVideoEnded")
  transition(name="fade")
    .controls(v-if="isControlVisible")
      input.seek-bar(
        type="range"
        :value="currentTimeSec"
        :max="$store.state.video.duration"
        @input="onSeekBarInput"
        @change="onSeekBarChange"
        @click.stop)
      .bottom
        .left
          button.play-button(
            :disabled="!loaded"
            @click.stop="onPlayButtonClick")
            i.fas.fa-lg(:class="playButtonClass")
          input.volume(
            type="range"
            max="1"
            step="0.01"
            :value="volume"
            @input="onVolumeInput"
            @click.stop)
          span.time
            | {{ formatTime(currentTimeSec) }}
            | /
            | {{ formatTime($store.state.video.duration) }}
        .right
          button(@click.stop="onViewModeButtonClick" v-if="!isFullscreen")
            i.fas.fa-lg.fa-th
          button(@click.stop="onFullscreenButtonClick")
            i.fas.fa-lg(:class="fullscreenButtonClass")
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
      autoPlay: true,
      loaded: false,
      paused: true,
      seeking: false,
      currentTime: 0,
      lastTime: Date.now(),
      isControlVisible: true,
      isFullscreen: false,
      hideControlTimeoutId: null,
      volume: 0.5,
    }
  },
  computed: {
    currentTimeSec() {
      return Math.floor(this.currentTime / 1000)
    },
    playButtonClass() {
      return {
        'fa-play': this.paused,
        'fa-pause': !this.paused
      }
    },
    fullscreenButtonClass() {
      return {
        'fa-expand': !this.isFullscreen,
        'fa-compress': this.isFullscreen
      }
    },
  },
  watch: {
    '$store.state.video.startTime': function() {
      console.log(`VideoPlayer: Update currentTime: ${Math.floor(this.$store.state.video.startTime / 1000)} sec`)
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
    this.hideControlLater()
  },
  mounted() {
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
      this.paused = false
      if (this.$refs.video) {
        this.$refs.video.play()
      }
    },
    pause() {
      this.paused = true
      if (this.$refs.video) {
        this.$refs.video.pause()
      }
    },
    togglePaused() {
      if (this.paused) {
        this.play()
      } else {
        this.pause()
      }
    },
    updateTime() {
      if (this.$refs.video && !this.$refs.video.paused) {
        this.currentTime += Date.now() - this.lastTime
      }
      this.lastTime = Date.now()
    },
    updateVideoVolume() {
      if (this.$refs.video) {
        const vol = this.volume * this.volume
        this.$refs.video.volume = vol
      }
    },
    //
    // Video Event
    //
    onVideoLoadStart() {
      this.loaded = false
    },
    onVideoCanPlay() {
      this.updateVideoVolume()
      this.loaded = true
    },
    onVideoPause(event) {
      this.paused = event.target.paused
    },
    onVideoPlaying(event) {
      this.paused = event.target.paused
    },
    onVideoEnded () {
      this.pause()
    },
    onVideoMouseMove () {
      this.showAndHideControlLater()
    },
    showControl() {
      this.isControlVisible = true
      if (this.hideControlTimeoutId != null) {
        clearTimeout(this.hideControlTimeoutId)
      }
    },
    hideControlLater() {
      this.hideControlTimeoutId = setTimeout(() => {
        this.isControlVisible = false
      }, 4 * 1000)
    },
    showAndHideControlLater() {
      this.showControl()
      if (!this.paused) {
        this.hideControlLater()
      }
    },
    //
    // Seek Bar Event
    //
    onSeekBarInput (event) {
      if (!this.seeking) {
        this.seeking = true
        if (this.loaded) {
          this.autoPlay = !this.paused
        }
        this.pause()
      }
      this.currentTime = event.target.value * 1000
    },
    onSeekBarChange (event) {
      this.currentTime = event.target.value * 1000
      console.log(`VideoPlayer: SeekbarChange: ${this.currentTime / 1000} sec ${Math.floor(this.currentTime/1000/60)} min`)
      this.$store.dispatch('startVideoAt', this.currentTime)
      this.seeking = false
    },
    //
    // Play Button Event
    //
    onPlayButtonClick (event) {
      this.togglePaused()
      event.currentTarget.blur()
    },
    //
    // Volume Event
    //
    onVolumeInput (event) {
      this.volume = event.target.value
      this.updateVideoVolume()
      this.$cookies.set('volume', this.volume, '1Y')
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
        this.isFullscreen = false
      } else {
        document.querySelector('.video-container')
          .webkitRequestFullscreen()
        this.isFullscreen = true
      }
    },
    //
    // ViewMode
    //
    onViewModeButtonClick(event) {
      this.$store.dispatch('toggleViewMode')
      event.currentTarget.blur()
    },
    //
    // Keyboard Event
    //
    onKeydown(event) {
      switch(event.key) {
      case ' ':
        if (!event.repeat) {
          this.togglePaused()
        }
        break
      case 'f':
        if (!event.repeat) {
          this.toggleFullscreen()
        }
        break
      case 'v':
        if (!event.repeat) {
          this.$store.dispatch('toggleViewMode')
        }
        break
      case 'ArrowRight':
        console.log('---')
        console.log(`VideoPlayer: ArrowRight: ${this.currentTime / 1000} sec ${Math.floor(this.currentTime/1000/60)} min`)
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
      margin 8px 0
      border-radius 3px
      background-color rgba(255, 255, 255, 0.5)
      outline 0
      cursor pointer
      filter drop-shadow(0 0px 1.8px rgba(0, 0, 0, .9))

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
        margin-bottom 8px

      &.volume
        display inline-block
        width 80px
        margin 8px 10px
        vertical-align middle

    button
      display inline-block
      width 36px
      height 36px
      background-color rgba(0, 0, 0, 0)
      color white
      border none
      outline 0
      cursor pointer
      filter drop-shadow(0 0px 1.8px rgba(0, 0, 0, .9))

      &:hover
        background-color rgba(0, 0, 0, .6)
        color #34c6ff
        transition: .4s

      &[disabled]
        opacity 0.9

      &.play-button
        width 56px

    .time
      font-size 12px
      filter drop-shadow(0 0px 1.8px rgba(0, 0, 0, .9))
</style>