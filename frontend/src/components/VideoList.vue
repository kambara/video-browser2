<template lang="pug">
ul
  li(v-for="(entry, index) in entries", :key="index")
    router-link(:to="linkToEntry(entry)" :class="entry.type")
      .scenes
        div(v-if="entry.thumbnailsDir")
          img(
            v-for="(path, index) in highlightImages(entry.thumbnailsDir)"
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
    highlightImages(thumbnailsDir) {
      const results = []
      for (let i = 0; i < 5; i++) {
        results.push(`${thumbnailsDir}/${i}.jpg`)
      }
      return results
    },
  },
}
</script>

<style lang="stylus" scoped>
item-shadow = 0 0 6px rgba(0, 0, 0, .1), 0 0 1px rgba(0, 0, 0, .2)

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
      color rgba(0, 0, 0, 0.9)

      &:hover
        color #0a95ff

      .scenes
        min-height 90px * 4
        box-shadow item-shadow

        img
          vertical-align top
          width 160px
          height 90px

          &:first-of-type
            width 160px * 2
            height 90px * 2

      .title
        padding-top 14px
        font-size 18px
        letter-spacing 0.02em
        line-height 1.45
        max-height 100%

    .directory
      box-shadow item-shadow
      color rgba(255, 255, 255, 0.9)

      &:hover
        color #34c6ff

      .scenes
        box-shadow none

      .title
        background-color #444
        padding 14px 8px 14px 16px
        display flex
        align-items center

        .left
          flex 1
        
        i
          font-size 24px
          margin-left 8px
</style>