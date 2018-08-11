<template>
  <div>
    <video
      type="video/mp4"
      :src="src"
      :autoplay="isAutoPlay"
      @canplay="onVideoCanPlay"
      @playing="updatePaused"
      @pause="updatePaused"
      @ended="onVideoEnded"
      >
    </video>
    <div>
      <input
        type="button"
        :value="playButtonLabel"
        :disabled="!loaded"
        @click="onPlayButtonClick"
        />
    </div>
    <input
      type="range"
      :value="currentTimeSec"
      :max="duration"
      @input="onSeekBarInput"
      @change="onSeekBarChange"
      />
    <div>
      {{ currentTimeSec }}
      /
      {{ duration }}
    </div>
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
      lastTime: Date.now()
    }
  },
  created: async function() {
    const response = await fetch(`/api/video-info/${this.path}`)
    const json = await response.json()
    this.duration = Math.floor(json.duration)
    setInterval(() => this.updateTime(), 100)
    this.seek()
  },
  computed: {
    currentTimeSec: function() {
      return Math.floor(this.currentTime / 1000)
    },
    playButtonLabel: function() {
      if (this.paused) {
        return 'Play'
      } else {
        return 'Pause'
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
    onVideoCanPlay: function(event) {
      if (!this.videoElement) {
        this.videoElement = event.target
      }
      this.loaded = true
    },
    onVideoEnded: function(event) {
      this.pause()
    },
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
    onPlayButtonClick: function(event) {
      if (this.paused) {
        this.play()
      } else {
        this.pause()
      }
    },
  }
}
</script>

<style>
  video {
    width: 800px;
    height: 450px;
  }
  input[type="range"] {
    width: 800px
  }
</style>