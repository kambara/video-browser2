<script>
export default {
  methods: {
    formatTime(timeSec) {
      const hour = Math.floor(timeSec / 60 / 60)
      const min = (Math.floor(timeSec / 60) % 60)
      const sec = (timeSec % 60)
      const secStr = sec.toString().padStart(2, '0')
      if (hour > 0) {
        const minStr = min.toString().padStart(2, '0')
        const hourStr = (hour >= 10)
          ? hour.toString().padStart(2, '0')
          : hour.toString()
        return `${hourStr}:${minStr}:${secStr}`
      } else {
        const minStr = (min >= 10)
          ? min.toString().padStart(2, '0')
          : min.toString()
        return `${minStr}:${secStr}`
      }
    },
  }
}
</script>