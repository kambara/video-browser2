<template>
  <div>
    <ul class="thumbnails">
      <li v-for="(time, index) in timestamps" :key='index'
        class="thumbnail"
        :style="{
          'background': `url(${tiledImagePath}) 0 0`,
          'background-position': `-${ 160 * (index % 10) }px -${ 90 * Math.floor(index / 10) }px`
        }"
        :data-time="time"
        @click="onThumbnailClick"
        ></li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    path: String
  },
  data: function() {
    return {
      tiledImagePath: null,
      duration: null,
      interval: 10,
      sharedState: window.store.state
    }
  },
  created: async function() {
    const response = await fetch(`/api/video-info/${this.path}`)
    const json = await response.json()
    console.log(json)
    this.tiledImagePath = json.tiledImagePath
    this.duration = Math.floor(json.duration)
    this.interval = json.interval
  },
  computed: {
    timestamps: function() {
      const times = []
      for (let time = 0; time <= this.duration; time += this.interval) {
        times.push(time)
      }
      return times
    },
  },
  methods: {
    onThumbnailClick: function(event) {
      const time = event.target.getAttribute('data-time')
      console.log(time)
      window.store.startVideoAt(parseInt(time))
    }
  }
}
</script>

<style scoped>
  ul {
    list-style-type: none;
    line-height: 0;
    padding: 0;
    margin: 0;
  }
  ul > li {
    display: inline-block;
  }
  .thumbnail {
    width: 160px;
    height: 90px;
    overflow: hidden;
  }
</style>
