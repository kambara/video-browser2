<template lang="pug">
div
  ul.thumbnails
    li.thumbnail(
      v-for="(time, index) in $store.getters.timestamps"
      :key="index"
      :data-time="time"
      :style="thumbnailStyle(index)"
      @click="onThumbnailClick"
      ) {{ formatTime(time) }}
</template>

<script>
import Vue from 'vue'
import Vuex from 'vuex'
import VideoUtil from '../mixins/VideoUtil'

Vue.use(Vuex)

export default {
  mixins: [VideoUtil],
  methods: {
    thumbnailStyle: function(index) {
      const x = 160 * (index % 10)
      const y = 90 * Math.floor(index / 10)
      return `
        background-image: url(${ this.$store.state.spriteImagePath });
        background-position: -${x}px -${y}px;`
    },
    onThumbnailClick: function(event) {
      const time = event.target.getAttribute('data-time')
      this.$store.dispatch('startVideoAt', parseInt(time) * 1000)
    }
  }
}
</script>

<style lang="stylus" scoped>
ul
  list-style-type none
  padding 0
  margin 16px

  & > li
    display inline-block
    width 160px
    height 90px
    vertical-align top
    overflow hidden
    cursor pointer
</style>
