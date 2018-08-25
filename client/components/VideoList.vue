<template lang="pug">
div
  nav
    .left
      router-link.back-button(
        :to="linkToParentList(path)"
        v-if="parent(path) != null")
        i.fas.fa-arrow-left
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
            i.fas.fa-folder
            | {{ basename(entry.path) }}
          .scenes(v-if="entry.thumbnails && entry.thumbnails.count > 0")
            img(v-for="(path, index) in repScenes(entry.thumbnails)"
              :src="path")
      div(v-if="entry.type == 'video'")
        router-link(:to="linkToVideo(entry.path)")
          .title
            i.fas.fa-play-circle
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
    path () {
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
        `/api/dir/thumbnails/create/${this.path}`)
      await response.json()
    },
    async onRecursiveButtonClick() {
      const response = await fetch(
        `/api/dir/thumbnails/create-recursive/${this.path}`)
      await response.json()
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
  background-color #222222

  .back-button
    display inline-block
    height 32px
    margin-right 24px
    line-height 32px

  .left
    margin-right auto

    h1
      display inline-block
      margin 0px
      padding 0px
      height 32px
      line-height 32px
      font-size 20px

  .right
    button
      margin-left 8px
      padding 6px 14px
      background-color #333
      border none
      border-radius 3px
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

        i
          margin-right 6px

      .scenes
        height 90px
        overflow hidden
        white-space nowrap

        img
          vertical-align top
</style>