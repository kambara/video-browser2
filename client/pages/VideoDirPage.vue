<template lang="pug">
div
  list-header
  video-list(:entries="entries")
  thumbnailer-progress
</template>

<script>
import ListHeader from '../components/ListHeader'
import VideoList from '../components/VideoList'
import ThumbnailerProgress from '../components/ThumbnailerProgress'

export default {
  data () {
    return {
      entries: [],
    }
  },
  computed: {
    path() {
      return this.$route.params[0] || ''
    }
  },
  watch: {
    '$route': function() {
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
  },
  components: {
    ListHeader,
    VideoList,
    ThumbnailerProgress
  }
}
</script>

<style lang="stylus" scoped>
</style>