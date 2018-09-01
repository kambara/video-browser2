<template lang="pug">
div
  nav
    .left
      router-link.back-button(
        :to="linkToParentList(path)"
        v-if="parent(path) != null"
      )
        i.material-icons arrow_back
      h1(v-if="path") {{ basename(path) }}
      h1(v-else) VIDEO BROWSER
    .right
      button(@click="onCreateThumbnailsButtonClick")
        | Create Thumbnails
      button(@click="onRecursiveButtonClick")
        | Recursive
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
  thumbnailer-progress
</template>

<script>
import VideoPath from '../mixins/VideoPath'
import ThumbnailerProgress from './ThumbnailerProgress'

export default {
  mixins: [VideoPath],
  props: ['path'],
  data () {
    return {
      entries: [],
      representativesCount: 6,
    }
  },
  watch: {
    path() {
      this.updateEntries()
    }
  },
  created: async function() {
    this.updateEntries()
  },
  methods: {
    async updateEntries() {
      const response = await fetch(`/api/dir/list/${this.path}`)
      this.entries = await response.json()
    },
    repScenes(thumbnails) {
      const results = []
      const replInterval = thumbnails.count / (this.representativesCount + 1)
      for (let i = 0; i < this.representativesCount; i++) {
        const index = Math.floor((i + 1) * replInterval)
        const sec = index * thumbnails.sceneInterval
        const imagePath = `${thumbnails.dirPath}/${sec}.jpg`
        results.push(imagePath)
      }
      return results
    },
    async onCreateThumbnailsButtonClick() {
      const response = await fetch(
        `/api/dir/thumbnails/create/${this.path}`,
        { method: 'POST' })
      const json = await response.json()
      console.log('Job count:', json.jobCount)
    },
    async onRecursiveButtonClick() {
      const response = await fetch(
        `/api/dir/thumbnails/create-recursive/${this.path}`,
        { method: 'POST' })
      const json = await response.json()
      console.log('Job count:', json.jobCount)
    },
  },
  components: {
    ThumbnailerProgress
  }
}
</script>

<style lang="stylus" scoped>
nav
  display flex
  padding 48px 16px 16px 16px
  font-size 20px
  background-color #333333

  .left
    flex 1
    white-space nowrap
    overflow hidden
    text-overflow ellipsis

    .back-button
      display inline-block
      margin-right 16px

      i
        vertical-align middle
        font-size 24px

    h1
      display inline-block
      margin 0px
      padding 0px
      font-size 18px
      font-weight 100
      vertical-align middle

  .right
    width 240px
    text-align right

    button
      height 32px
      padding 0 16px
      line-height 32px
      background-color rgba(0, 0, 0, 0)
      border none
      color rgba(255, 255, 255, 0.5)
      font-size 12px
      cursor pointer

      &:hover
        background-color #444
        color rgba(255, 255, 255, .9)

ul
  padding 0
  list-style-type none
  margin 16px
  margin-bottom 80px

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