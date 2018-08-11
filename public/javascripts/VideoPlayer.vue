<template>
  <div class="video-container"
    @mousemove="onVideoMouseMove"
    :style="{ width: width+'px', height: height+'px' }"
    >
    <video
      type="video/mp4"
      :src="src"
      :autoplay="isAutoPlay"
      :width="width"
      :height="height"
      @canplay="onVideoCanPlay"
      @playing="updatePaused"
      @pause="updatePaused"
      @ended="onVideoEnded"
      >
    </video>
    <transition name="fade">
      <div class="controls" v-if="isControlVisible">
        <input
          type="range"
          class="seek-bar"
          :value="currentTimeSec"
          :max="duration"
          @input="onSeekBarInput"
          @change="onSeekBarChange"
          />
        <div>
          <button class="fullscreen-button" @click="toggleFullscreen">
            <i class="fas fa-lg" :class="fullscreenButtonClass"></i>
          </button>
          <button
            class="play-button"
            :disabled="!loaded"
            @click="onPlayButtonClick"
            >
            <i class="fas fa-lg" :class="playButtonClass"></i>
          </button>
          <input
            type="range"
            class="volume"
            max=1
            step="0.01"
            :value="volume"
            @input="onVolumeInput"
            />
          <span class="time">
            {{ currentTimeSec }}
            /
            {{ duration }}
          </span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
module.exports = {
  props: {
    path: String
  },
  data: function () {
    return {
      src: '',
      duration: 0,
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
    const response = await fetch(`/api/video-info/${this.path}`)
    const json = await response.json()
    this.duration = Math.floor(json.duration)
    setInterval(() => this.updateTime(), 100)
    this.seek()
    this.hideControlLater()
  },
  mounted: function() {
    this.onWindowResize()
    window.addEventListener('resize', this.onWindowResize)
  },
  beforeDestroy: function() {
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
    }
  },
  methods: {
    seek: function() {
      this.loaded = false
      const sec = Math.floor(this.currentTime / 1000)
      this.src = `/api/video-file/${this.path}?time=${sec}`
    },
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
    onVideoCanPlay: function(event) {
      if (!this.videoElement) {
        this.videoElement = event.target
      }
      this.loaded = true
    },
    onVideoEnded: function(event) {
      this.pause()
    },
    onVideoMouseMove: function(event) {
      this.isControlVisible = true
      if (this.hideControlTimeoutId != null) {
        clearTimeout(this.hideControlTimeoutId)
      }
      if (!this.paused) {
        this.hideControlLater()
      }
    },
    hideControlLater: function(event) {
      this.hideControlTimeoutId = setTimeout(this.hideControl, 4*1000)
    },
    hideControl: function(event) {
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
      this.seek()
      this.seeking = false
    },
    //
    // Play Button
    //
    onPlayButtonClick: function(event) {
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
      let height = Math.round(this.width * 9/16)
      if (height > window.innerHeight) {
        height = window.innerHeight
      }
      this.height = height
    }
  }
}
</script>

<style>
  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }
  .video-container {
    position: relative;
  }
  video {
    background-color: black;
  }
  .controls {
    position: absolute;
    bottom: 0px;
    width: 100%;
    padding: 16px 16px;
    box-sizing: border-box;
  }
  input[type="range"] {
    -webkit-appearance: none;
    height: 5px;
    box-sizing: border-box;
    margin: 8px 0;
    border-radius: 3px;
    background-color: rgba(255, 255, 255, 0.3);
    outline: 0;
    cursor: pointer;
  }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    position: relative;
    display: block;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: white;
    cursor: pointer;
  }
  input[type="range"].seek-bar {
    display: block;
    width: 100%;
    margin-bottom: 16px;
  }
  button {
    width: 36px;
    height: 36px;
    background-color: rgba(0, 0, 0, 0);
    color: white;
    border: none;
    border-radius: 6px;
    outline: 0;
    cursor: pointer;
  }
  button:hover {
    background-color: rgba(0, 0, 0, 0.5);
  }
  button.play-button {
    width: 56px;
  }
  button.fullscreen-button {
    float: right;
  }
  input[type="range"].volume {
    display: inline-block;
    width: 100px;
    margin: 8px 10px;
    vertical-align: middle;
  }
</style>