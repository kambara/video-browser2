window.store = {
  state: {
    startVideoAt: null
  },
  startVideoAt(time) {
    console.log('startAt action:', time)
    this.state.startVideoAt = time
  }
}
