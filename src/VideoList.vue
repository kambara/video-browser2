<template>
  <div>
    <nav>
      <div v-if="parentDir != null">
        <router-link :to="linkToList(parentDir)" class="back-button">
          <i class="fas fa-arrow-left"></i>
        </router-link>
        <h2>
          {{ basename(relativePath) }}
        </h2>
      </div>
    </nav>
    <ul>
      <li v-for="(entry, index) in entries" :key="index">
        <div v-if="entry.type == 'directory'">
          <router-link :to="linkToList(entry.path)">
            /{{ basename(entry.path) }}/
          </router-link>
        </div>
        <div v-if="entry.type == 'file'">
          <router-link :to="linkToVideo(entry.path)">
            {{ basename(entry.path) }}
          </router-link>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import VideoUtil from './VideoUtil'

export default {
  data: function() {
    return {
      relativePath: null,
      entries: [
        // type: ''
        // path: ''
      ]
    }
  },
  created: function() {
    this.relativePath = (this.$route.params[0] || '')
  },
  watch: {
    '$route': function(to, from) {
      this.relativePath = (this.$route.params[0] || '')
    },
    relativePath: async function() {
      const response = await fetch(`/api/list/${this.relativePath}`)
      this.entries = await response.json()
    }
  },
  computed: {
    parentDir: function() {
      const path = this.relativePath.replace(/\/$/, '')
      if (path.length === 0) {
        return null
      }
      const elements = path.split('/')
      elements.pop()
      return elements.join('/')
    }
  },
  mixins: [VideoUtil],
  methods: {
    linkToList: function(path) {
      return `/list/${path}`
    },
    linkToVideo: function(path) {
      return `/video/${path}`
    },
  },
}
</script>

<style scoped>
  nav {
    margin: 16px;
    font-size: 20px;
  }
  .back-button {
    display: inline-block;
    width: 32px;
    height: 32px;
    line-height: 32px;
    text-align: center;
    margin-right: 8px;
  }
  h2 {
    display: inline-block;
        margin: 0px;
    padding: 0px;
    height: 32px;
    line-height: 32px;
    font-size: 20px;
  }
  li {
    font-size: 16px;
  }
</style>