<template lang="pug">
div
  list-header
  video-list(:entries="entries" ref="videoList")
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
      totalCount: 0,
      offset: 0,
      loading: false,
    }
  },
  computed: {
    path() {
      return this.$route.params[0] || ''
    }
  },
  watch: {
    '$route': function() {
      this.init()
      this.updateEntries()
    }
  },
  created: async function() {
    this.init()
    this.updateEntries()
  },
  mounted() {
    window.addEventListener('scroll', this.onScroll)
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.onScroll)
  },
  methods: {
    init() {
      this.entries = []
      this.totalCount = 0
      this.offset = 0
      this.loading = false
    },
    async updateEntries() {
      if (this.loading) return
      if (this.totalCount > 0
        && this.offset >= this.totalCount) return
      this.loading = true
      const limit = 10
      const response = await fetch(
        `/api/dir/list/${this.path}?limit=${limit}&offset=${this.offset}`
      )
      const { entries, totalCount } = await response.json()
      this.entries = this.entries.concat(entries)
      this.totalCount = totalCount
      this.offset += limit
      setTimeout(() => {
        this.loading = false
        this.onScroll()
      }, 500)
    },
    onScroll() {
      if (this.loading) return
      const videoListElement = this.$refs.videoList.$el
      const top = videoListElement.getBoundingClientRect().top
      const bottom = top + videoListElement.clientHeight
      if (bottom <= window.innerHeight + 200) {
        this.updateEntries()
      }
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