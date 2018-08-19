<script>
export default {
  methods: {
    basename (path) {
      path = path.trim().replace(/\/$/, '')
      return path.split('/').pop()
    },
    parent (path) {
      path = path.trim().replace(/\/$/, '')
      if (path.length === 0) {
        return null
      }
      const elements = path.split('/')
      elements.pop()
      return elements.join('/')
    },
    linkToParentList (path) {
      return this.linkToList(this.parent(path))
    },
    linkToList (path) {
      return `/list/${path}`
    },
    linkToVideo (path) {
      return `/video/${path}`
    },
  }
}
</script>