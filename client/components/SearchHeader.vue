<template lang="pug">
nav
  .bottom
    .left
      router-link.back-button(:to="linkToList('')")
        i.material-icons arrow_back
      h1
        | {{ query }}
    .right
      input.search(
        @change="onSearchInputChange"
        @keydown.stop
        :value="query"
        placeholder="Search"
      )
</template>

<script>
import VideoPath from '../mixins/VideoPath'

export default {
  mixins: [VideoPath],
  computed: {
    query() {
      return this.$route.params.query
    }
  },
  methods: {
    //
    // Search event
    //
    onSearchInputChange(event) {
      const query = event.currentTarget.value
      if (query.length === 0) return
      this.$router.push({
        name: 'search',
        params: { query: query }
      })
    },
  },
}
</script>

<style lang="stylus" scoped>
@import "../styles/video-list.styl"
</style>