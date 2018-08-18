import Vuex from 'vuex'

const store = new Vuex.Store({
  state: {
    videoPath: null,
    duration: 0,
    allScenesImagePath: null,
    sceneInterval: null,
    videoStartTime: 0
  },
  getters: {
    timestamps: state => {
      if (!state.duration || !state.sceneInterval) {
        return []
      }
      const times = []
      for (let time = 0; time <= state.duration; time += state.sceneInterval) {
        times.push(time)
      }
      return times
    },
    src: state => {
      const sec = Math.floor(state.videoStartTime / 1000)
      return `/api/video-file/${state.videoPath}?time=${sec}`
    }
  },
  mutations: {
    setVideoPath(state, path) {
      state.videoPath = path
    },
    setVideoStartTime(state, time) {
      state.videoStartTime = time
    },
    setVideoInfo(state, info) {
      console.log(info)
      state.duration = Math.floor(info.duration)
      state.sceneInterval = info.interval
      state.allScenesImagePath = info.allScenesImagePath
    }
  },
  actions: {
    setVideoPath({ commit, dispatch }, path) {
      commit('setVideoPath', path)
      if (path.length > 0) {
        dispatch('loadVideoInfo')
      }
    },
    async loadVideoInfo({ commit, state }) {
      const url = `/api/video-info/${state.videoPath}`
      const response = await fetch(url)
      const json = await response.json()
      commit('setVideoInfo', json)
    },
    startVideoAt({ commit }, time) {
      commit('setVideoStartTime', time)
    },
  }
})

export default store