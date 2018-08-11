<template>
  <div>
    <h1>{{ basename(path) }}</h1>
    <video-player :path="path" />
  </div>
</template>

<script>
module.exports = {
  data: function () {
    return {
      path: (this.$route.params[0] || '')
    }
  },
  components: {
    VideoPlayer: httpVueLoader('/javascripts/VideoPlayer.vue')
  },
  mixins: [VideoUtil],
}
</script>

<style>
</style>