<template lang="pug">
div
  search-header
  video-list(:entries="entries")
  thumbnailer-progress
</template>

<script>
import SearchHeader from '../components/SearchHeader'
import VideoList from '../components/VideoList'
import ThumbnailerProgress from '../components/ThumbnailerProgress'

export default {
  data () {
    return {
      entries: [],
    }
  },
  computed: {
    query() {
      return this.$route.params.query
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
      const response = await fetch(`/api/search/${this.query}`)
      this.entries = await response.json()
    },
  },
  components: {
    SearchHeader,
    VideoList,
    ThumbnailerProgress
  }
}
</script>

<style lang="stylus" scoped>
</style>