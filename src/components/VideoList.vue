<template lang="pug">
div
  nav
    div(v-if="parent(path) != null")
      router-link.back-button(:to="linkToParentList(path)")
        i.fas.fa-arrow-left
      h2
        | {{ basename(path) }}
  ul
    li(v-for='(entry, index) in entries', :key='index')
      div(v-if="entry.type == 'directory'")
        router-link(:to='linkToList(entry.path)')
          | /{{ basename(entry.path) }}/
      div(v-if="entry.type == 'file'")
        router-link(:to='linkToVideo(entry.path)')
          | {{ basename(entry.path) }}
</template>

<script>
import VideoUtil from './VideoUtil'

export default {
  mixins: [VideoUtil],
  props: ['path'],
  data () {
    return {
      entries: []
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
    async updateEntries () {
      const response = await fetch(`/api/list/${this.path}`)
      this.entries = await response.json()
    }
  }
}
</script>

<style lang="stylus" scoped>
nav
  margin 16px
  font-size 20px

  .back-button
    display inline-block
    width 32px
    height 32px
    line-height 32px
    text-align center
    margin-right 8px

  h2
    display inline-block
    margin 0px
    padding 0px
    height 32px
    line-height 32px
    font-size 20px

li
  font-size 16px
</style>