<template lang="pug">
nav
  .top
    button(@click="onRandomButtonClick")
      | Random
    button(@click="onCreateThumbnailsButtonClick")
      | Create Thumbnails
    button(@click="onRecursiveButtonClick")
      | Recursive
  .bottom
    .left
      router-link.back-button(
        :to="linkToParentList(path)"
        v-if="parent(path) != null"
      )
        i.material-icons arrow_back
      h1(v-if="path") {{ basename(path) }}
      h1(v-else) VIDEO BROWSER
    .right
      input.search(
        @change="onSearchInputChange"
        @keydown.stop
        placeholder="Search"
      )
</template>

<script>
import VideoPath from '../mixins/VideoPath'

export default {
  mixins: [VideoPath],
  computed: {
    path() {
      return this.$route.params[0] || ''
    }
  },
  mounted() {
    window.addEventListener('keydown', this.onKeydown)
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.onKeydown)
  },
  methods: {
    //
    // Button event
    //
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
    onRandomButtonClick() {
      this.$router.push('/random')
    },
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
    //
    // Keyboard event
    //
    onKeydown(event) {
      if (event.metaKey || event.ctrlKey) return
      switch(event.key) {
      case 'r':
        this.$router.push('/random')
        break
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
@import "../styles/video-list-header.styl"
</style>