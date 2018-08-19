<template lang="pug">
.video-container(
  @mousemove='onVideoMouseMove'
  :style="{ width: width+'px', height: height+'px' }")
  video(
    type='video/mp4'
    :src='$store.getters.src'
    :autoplay='isAutoPlay'
    :width='width'
    :height='height'
    @canplay='onVideoCanPlay'
    @loadstart='onVideoLoadStart'
    @playing='updatePaused'
    @pause='updatePaused'
    @ended='onVideoEnded')
  transition(name='fade')
    .controls(v-if='isControlVisible')
      input.seek-bar(
        type='range'
        :value='currentTimeSec'
        :max='$store.state.duration'
        @input='onSeekBarInput'
        @change='onSeekBarChange')
      div
        button.fullscreen-button(@click='toggleFullscreen')
          i.fas.fa-lg(:class='fullscreenButtonClass')
        button.play-button(:disabled='!loaded' @click='onPlayButtonClick')
          i.fas.fa-lg(:class='playButtonClass')
        input.volume(
          type='range'
          max='1'
          step='0.01'
          :value='volume'
          @input='onVolumeInput')
        span.time
          | {{ currentTimeSec }}
          | /
          | {{ $store.state.duration }}
</template>

<script>
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default {
  data: function () {
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
  created: async function() {
    setInterval(() => this.updateTime(), 100)
  },
  mounted: function() {
    this.onWindowResize()
    window.addEventListener('resize', this.onWindowResize)
  },
  beforeDestroy: function() {
    this.pause()
    if (this.videoElement) {
      this.videoElement.removeAttribute('src')
      this.videoElement.load()
    }
    window.removeEventListener('resize', this.onWindowResize)
  },
  computed: {
    currentTimeSec: function() {
      return Math.floor(this.currentTime / 1000)
    },
    playButtonClass: function() {
      return {
        'fa-play': this.paused,
        'fa-pause': !this.paused
      }
    },
    fullscreenButtonClass: function() {
      return {
        'fa-expand': !this.isFullscreen,
        'fa-compress': this.isFullscreen
      }
    },
  },
  watch: {
    '$store.state.videoStartTime': function() {
      this.currentTime = this.$store.state.videoStartTime
    }
  },
  methods: {
    play: function() {
      if (this.videoElement) {
        this.videoElement.play()
      }
    },
    pause: function() {
      if (this.videoElement) {
        this.videoElement.pause()
      }
    },
    updateTime: function() {
      if (this.videoElement && !this.videoElement.paused) {
        this.currentTime += Date.now() - this.lastTime
      }
      this.lastTime = Date.now()
    },
    updatePaused: function(event) {
      this.paused = event.target.paused
    },
    //
    // Video Event
    //
    onVideoLoadStart: function() {
      this.loaded = false
    },
    onVideoCanPlay: function(event) {
      if (!this.videoElement) {
        this.videoElement = event.target
      }
      this.loaded = true
    },
    onVideoEnded: function() {
      this.pause()
    },
    onVideoMouseMove: function() {
      this.isControlVisible = true
      if (this.hideControlTimeoutId != null) {
        clearTimeout(this.hideControlTimeoutId)
      }
      if (!this.paused) {
        this.hideControlLater()
      }
    },
    hideControlLater: function() {
      this.hideControlTimeoutId = setTimeout(this.hideControl, 4*1000)
    },
    hideControl: function() {
      this.isControlVisible = false
    },
    //
    // Seek Bar
    //
    onSeekBarInput: function(event) {
      if (!this.seeking) {
        this.seeking = true
        if (this.loaded) {
          this.isAutoPlay = !this.paused
        }
        this.pause()
      }
      this.currentTime = event.target.value * 1000
    },
    onSeekBarChange: function(event) {
      this.currentTime = event.target.value * 1000
      this.$store.dispatch('startVideoAt', this.currentTime)
      this.seeking = false
    },
    //
    // Play Button
    //
    onPlayButtonClick: function() {
      if (this.paused) {
        this.play()
      } else {
        this.pause()
      }
    },
    //
    // Volume
    //
    onVolumeInput: function(event) {
      if (this.videoElement) {
        this.volume = event.target.value
        this.videoElement.volume = this.volume
      }
    },
    //
    // Fullscreen
    //
    toggleFullscreen: function() {
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
    // Window Resize
    //
    onWindowResize: function() {
      this.width = window.innerWidth
      this.height = window.innerHeight
      // let height = Math.round(this.width * 9/16)
      // if (height > window.innerHeight) {
      //   height = window.innerHeight
      // }
      // this.height = height
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

  video
    background-color black

  .controls
    position absolute
    bottom 0px
    width 100%
    padding 16px 16px
    box-sizing border-box
    background-color rgba(0, 0, 0, 0.3)

    input[type="range"]
      -webkit-appearance none
      height 5px
      box-sizing border-box
      margin 8px 0
      border-radius 3px
      background-color rgba(255, 255, 255, 0.3)
      outline 0
      cursor pointer

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
        width 100px
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
      &:hover
        background-color rgba(0, 0, 0, 0.5)
      &[disabled]
        opacity 0.4
      &.play-button
        width 56px
      &.fullscreen-button
        float right
</style>