<template lang="pug">
.video-container(
  @mousemove="onVideoMouseMove"
  :style="{ }")
  video(
    type="video/mp4"
    :src="$store.getters.src"
    :autoplay="isAutoPlay"
    :width="width"
    :height="height"
    @canplay="onVideoCanPlay"
    @loadstart="onVideoLoadStart"
    @playing="updatePaused"
    @pause="updatePaused"
    @ended="onVideoEnded")
  transition(name="fade")
    .controls(v-if="isControlVisible")
      input.seek-bar(
        type="range"
        :value="currentTimeSec"
        :max="$store.state.duration"
        @input="onSeekBarInput"
        @change="onSeekBarChange")
      .bottom
        .left
          button.play-button(:disabled="!loaded" @click.stop="onPlayButtonClick")
            i.fas.fa-lg(:class="playButtonClass")
          input.volume(
            type="range"
            max="1"
            step="0.01"
            :value="volume"
            @input.stop="onVolumeInput"
            @click.stop
            )
          span.time
            | {{ formatTime(currentTimeSec) }}
            | /
            | {{ formatTime($store.state.duration) }}
        .right
          button(@click.stop="toggleViewMode" v-if="!isFullscreen")
            i.fas.fa-lg.fa-th
          button(@click.stop="toggleFullscreen")
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
  data () {
    return {
      isAutoPlay: true,
      loaded: false,
      paused: true,
      seeking: false,
      videoElement: null,
      currentTime: 0,
      lastTime: Date.now(),
      isControlVisible: true,
      isFullscreen: false,
      hideControlTimeoutId: null,
      volume: 0.5,
      width: 0,
      height: 0,
    }
  },
  computed: {
    currentTimeSec () {
      return Math.floor(this.currentTime / 1000)
    },
    playButtonClass () {
      return {
        'fa-play': this.paused,
        'fa-pause': !this.paused
      }
    },
    fullscreenButtonClass () {
      return {
        'fa-expand': !this.isFullscreen,
        'fa-compress': this.isFullscreen
      }
    },
  },
  watch: {
    '$store.state.videoStartTime' () {
      this.currentTime = this.$store.state.videoStartTime
    }
  },
  created: async function() {
    setInterval(() => this.updateTime(), 100)
    const vol = this.$cookies.get('volume')
    if (vol != null) {
      this.volume = vol
    }
    this.hideControlLater()
  },
  beforeDestroy () {
    this.pause()
    if (this.videoElement) {
      this.videoElement.removeAttribute('src')
      this.videoElement.load()
    }
  },
  methods: {
    play() {
      if (this.videoElement) {
        this.videoElement.play()
      }
    },
    pause() {
      if (this.videoElement) {
        this.videoElement.pause()
      }
    },
    updateTime() {
      if (this.videoElement && !this.videoElement.paused) {
        this.currentTime += Date.now() - this.lastTime
      }
      this.lastTime = Date.now()
    },
    updatePaused(event) {
      this.paused = event.target.paused
    },
    updateVideoVolume() {
      if (this.videoElement) {
        const vol = this.volume * this.volume
        this.videoElement.volume = vol
      }
    },
    //
    // Video Event
    //
    onVideoLoadStart() {
      this.loaded = false
    },
    onVideoCanPlay(event) {
      if (!this.videoElement) {
        this.videoElement = event.target
        this.updateVideoVolume()
      }
      this.loaded = true
    },
    onVideoEnded () {
      this.pause()
    },
    onVideoMouseMove () {
      this.isControlVisible = true
      if (this.hideControlTimeoutId != null) {
        clearTimeout(this.hideControlTimeoutId)
      }
      if (!this.paused) {
        this.hideControlLater()
      }
    },
    hideControlLater () {
      this.hideControlTimeoutId = setTimeout(() => {
        this.isControlVisible = false
      }, 4 * 1000)
    },
    //
    // Seek Bar Event
    //
    onSeekBarInput (event) {
      if (!this.seeking) {
        this.seeking = true
        if (this.loaded) {
          this.isAutoPlay = !this.paused
        }
        this.pause()
      }
      this.currentTime = event.target.value * 1000
    },
    onSeekBarChange (event) {
      this.currentTime = event.target.value * 1000
      this.$store.dispatch('startVideoAt', this.currentTime)
      this.seeking = false
    },
    //
    // Play Button Event
    //
    onPlayButtonClick () {
      if (this.paused) {
        this.play()
      } else {
        this.pause()
      }
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
    // Fullscreen Event
    //
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
    toggleViewMode() {
      this.$store.dispatch('toggleViewMode')
    }
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
    padding 16px 16px
    box-sizing border-box
    // background-color rgba(0, 0, 0, 0.3)

    .bottom
      display flex

      .left
        margin-right auto

    input[type="range"]
      -webkit-appearance none
      height 5px
      box-sizing border-box
      margin 8px 0
      border-radius 3px
      background-color rgba(255, 255, 255, 0.4)
      outline 0
      cursor pointer
      filter drop-shadow(0 1px 2px rgba(0, 0, 0, .5))

      &::-webkit-slider-thumb
        -webkit-appearance none
        position relative
        display block
        width 14px
        height 14px
        border-radius 50%
        background-color white
        cursor pointer

      &.seek-bar
        display block
        width 100%
        margin-bottom 16px

      &.volume
        display inline-block
        width 80px
        margin 8px 10px
        vertical-align middle

    button
      width 36px
      height 36px
      background-color rgba(0, 0, 0, 0)
      color white
      border none
      border-radius 6px
      outline 0
      cursor pointer
      filter drop-shadow(0 1px 2px rgba(0, 0, 0, .5))

      &:hover
        background-color rgba(0, 0, 0, 0.5)

      &[disabled]
        opacity 0.4

      &.play-button
        width 56px

    .time
      font-size 12px
      filter drop-shadow(0 1px 2px rgba(0, 0, 0, .5))
</style>