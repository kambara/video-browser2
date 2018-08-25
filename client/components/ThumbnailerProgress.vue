<template lang="pug">
.container(v-if="$store.state.thumbnailerQueue.totalCount > 0")
  .message
    .left Creating thumbnails
    .right
      | {{ $store.state.thumbnailerQueue.completeCount + 1 }}
      | /
      | {{ $store.state.thumbnailerQueue.totalCount }}
  .message.failed(v-if="$store.state.thumbnailerQueue.failedCount > 0")
    .left Failed
    .right {{ $store.state.thumbnailerQueue.failedCount }}
  .video-title {{ $store.state.thumbnailerQueue.title }}
  progress(max="100" :value="$store.state.thumbnailerQueue.progress")
</template>

<script>
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default {
  data() {
    return {
    }
  },
}
</script>

<style lang="stylus" scoped>
.container
  position fixed
  z-index 1
  bottom 8px
  right 8px
  width 200px
  padding 10px 16px
  background-color #333333
  border-radius 6px
  font-size 12px

  .message
    display flex
    margin-bottom 4px
    color rgba(255, 255, 255, 0.7)

    .left
      margin-right auto

    .right
      font-size 11px

  .failed
    color #D23838

  .video-title
    margin-bottom 8px
    font-size 11px
    color rgba(255, 255, 255, 0.35)
    white-space nowrap
    overflow hidden
    text-overflow ellipsis

  progress
    display block
    width 100%
    -webkit-appearance none
    appearance none
    height 1px

    &[value]::-webkit-progress-bar
      background-color: rgba(255, 255, 255, 0.1)

    &[value]::-webkit-progress-value
      background-color: rgba(255, 255, 255, 0.4)
</style>