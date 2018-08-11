<template>
  <div>
    <video-player :path="path"></video-player>
    <h2>{{ basename(path) }}</h2>
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

<style scoped>
  h2 {
    padding: 0;
    margin: 16px;
    font-size: 18px;
    font-weight: normal;
  }
</style>