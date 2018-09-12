<template lang="pug">
ul
  li(v-for="(entry, index) in entries", :key="index")
    div(v-if="entry.type == 'directory'")
      router-link(:to="linkToList(entry.path)")
        .title
          i.material-icons video_library
          | {{ basename(entry.path) }}
        .scenes(v-if="entry.thumbnails && entry.thumbnails.count > 0")
          img(v-for="(path, index) in repScenes(entry.thumbnails)"
            :src="path")
    div(v-if="entry.type == 'video'")
      router-link(:to="linkToVideo(entry.path)")
        .title
          i.material-icons play_circle_filled
          | {{ basename(entry.path) }}
        .scenes(v-if="entry.thumbnails.count > 0")
          img(v-for="(path, index) in repScenes(entry.thumbnails)"
            :src="path")
</template>

<script>
import VideoPath from '../mixins/VideoPath'

export default {
  mixins: [VideoPath],
  props: {
    entries: Array
  },
  methods: {
    repScenes(thumbnails) {
      const representativesCount = 6
      const results = []
      const replInterval = thumbnails.count / (representativesCount + 1)
      for (let i = 0; i < representativesCount; i++) {
        const index = Math.floor((i + 1) * replInterval)
        const sec = index * thumbnails.sceneInterval
        const imagePath = `${thumbnails.dirPath}/${sec}.jpg`
        results.push(imagePath)
      }
      return results
    },
  },
}
</script>

<style lang="stylus" scoped>
ul
  margin 0
  padding 16px
  list-style-type none

  li
    margin-bottom 16px

    a
      display: block

      .title
        margin 8px 0
        font-size 14px
        letter-spacing 0.03em
        vertical-align middle
        font-weight 100

        i
          margin-right 6px
          vertical-align middle
          font-size 24px

      .scenes
        height 90px
        overflow hidden
        white-space nowrap

        img
          vertical-align top
</style>