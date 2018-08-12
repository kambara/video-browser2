<template>
  <div>
    Hello
  </div>
</template>

<script>
module.exports = {
  props: {
    path: String
  },
  data: function() {
    return {
    }
  },
  created: async function() {
    const response = await fetch(`/api/video-info/${this.path}`)
    const json = await response.json()
    console.log(json)
  },
}
</script>

<style scoped>

</style>
