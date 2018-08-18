import Vuex from 'vuex'

const store = new Vuex.Store({
  state: {
    videoStartTime: 0
  },
  mutations: {
    setVideoStartTime(state, time) {
      console.log('setVideoStartTime:', time)
      state.videoStartTime = time
    }
  },
  actions: {
    startVideoAt(context, time) {
      console.log('startVideoAt:', time)
      context.commit('setVideoStartTime', time)
    }
  }
})

export default store