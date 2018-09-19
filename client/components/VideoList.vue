<template lang="pug">
ul
  li(v-for="(entry, index) in entries", :key="index")
    router-link(:to="linkToEntry(entry)" :class="entry.type")
      .scenes
        div(v-if="entry.thumbnails && entry.thumbnails.count > 0")
          img.representative(:src="entry.thumbnails.representativeImage")
          img(
            v-for="(path, index) in repScenes(entry.thumbnails)"
            :src="path"
          )
      .title
        .left {{ basename(entry.path) }}
        i.material-icons(v-if="entry.type === 'directory'") chevron_right
</template>

<script>
import VideoPath from '../mixins/VideoPath'

export default {
  mixins: [VideoPath],
  props: {
    entries: Array
  },
  methods: {
    linkToEntry(entry) {
      switch(entry.type) {
      case 'directory':
        return this.linkToList(entry.path)
      case 'video':
        return this.linkToVideo(entry.path)
      }
      return ''
    },
    mainScene(thumbnails) {
      const index = Math.floor(thumbnails.count * 1/3)
      const sec = index * thumbnails.sceneInterval
      return `${thumbnails.dirPath}/${sec}.jpg`
    },
    repScenes(thumbnails) {
      const representativesCount = 4
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
item-shadow = 0 0 8px rgba(0, 0, 0, .2), 0 0 1px rgba(0, 0, 0, .3)

ul
  display flex
  flex-wrap wrap
  margin 0
  padding 16px
  list-style-type none

  li
    flex-basis 160px * 2
    margin 16px

    a
      display block
      color rgba(255, 255, 255, 0.7)

      &:hover
        color #34c6ff

      .scenes
        min-height 90px * 4
        background-color #202020
        box-shadow item-shadow

        img
          vertical-align top

          &.representative
            width 160px * 2
            height 90px * 2

      .title
        padding 8px 0
        font-size 14px
        letter-spacing 0.02em
        line-height 1.5

    .directory
      box-shadow item-shadow

      .scenes
        box-shadow none

      .title
        background-color #202020
        padding 8px 12px
        display flex
        align-items center

        .left
          flex 1
        
        i
          font-size 18px
          margin-left 8px
</style>