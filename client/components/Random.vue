<template lang="pug">
div
</template>

<script>
export default {
  created: async function() {
    const response = await fetch('/api/random')
    const json = await response.json()
    this.$router.replace(`/video/${json.path}`)
  }
}
</script>