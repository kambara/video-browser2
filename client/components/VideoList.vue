<template lang="pug">
div
  nav
    div(v-if="parent(path) != null")
      router-link.back-button(:to="linkToParentList(path)")
        i.fas.fa-arrow-left
      h2
        | {{ basename(path) }}
    div
      button(@click="onCreateThumbnailsButtonClick")
        | Create Thumbnails
  ul
    li(v-for="(entry, index) in entries", :key="index")
      div(v-if="entry.type == 'directory'")
        router-link(:to="linkToList(entry.path)")
          .title
            i.fas.fa-folder
            | {{ basename(entry.path) }}
          .scenes(v-if="entry.thumbnailsCount > 0")
            img(v-for="(path, index) in representativeScenes(entry)"
              :src="path")
      div(v-if="entry.type == 'file'")
        router-link(:to="linkToVideo(entry.path)")
          .title
            i.fas.fa-play-circle
            | {{ basename(entry.path) }}
          .scenes(v-if="entry.thumbnailsCount > 0")
            img(v-for="(path, index) in representativeScenes(entry)"
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
    representativeScenes(entry) {
      const results = []
      const replInterval = entry.thumbnailsCount / (this.representativesCount + 1)
      for (let i = 0; i < this.representativesCount; i++) {
        const index = Math.floor((i + 1) * replInterval)
        const sec = index * entry.sceneInterval
        const imagePath = `${entry.thumbnailsDirPath}/${sec}.jpg`
        results.push(imagePath)
      }
      return results
    },
    async onCreateThumbnailsButtonClick() {
      const response = await fetch(`/api/dir/create-thumbnails/${this.path}`)
      const json = await response.json()
      console.log(json)
    }
  },
  components: {
    ThumbnailerProgress
  }
}
</script>

<style lang="stylus" scoped>
nav
  padding 16px 0
  margin-bottom 16px
  font-size 20px

  .back-button
    display inline-block
    width 32px
    height 32px
    margin-left 8px
    margin-right 16px
    line-height 32px
    text-align center

  h2
    display inline-block
    margin 0px
    padding 0px
    height 32px
    line-height 32px
    font-size 20px
ul
  padding 0
  list-style-type none
  margin 16px

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