import Vue from 'vue'
import Vuex from 'vuex'
import { ViewMode } from './enum'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    videoPath: null,
    duration: 0,
    allScenesImagePath: null,
    sceneInterval: null,
    videoStartTime: 0,
    viewMode: ViewMode.PLAYER
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
      if (!state.videoPath) {
        return ''
      }
      const sec = Math.floor(state.videoStartTime / 1000)
      return `/api/video/file/${state.videoPath}?time=${sec}`
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
      state.duration = Math.floor(info.duration)
      state.sceneInterval = info.interval
      state.allScenesImagePath = info.allScenesImagePath
    },
    setViewMode(state, viewMode) {
      state.viewMode = viewMode
    }
  },
  actions: {
    initVideo({ commit, dispatch }, path) {
      commit('setVideoPath', path)
      commit('setVideoStartTime', 0)
      if (path && path.length > 0) {
        dispatch('loadVideoInfo')
      }
    },
    async loadVideoInfo({ commit, state }) {
      const url = `/api/video/info/${state.videoPath}`
      const response = await fetch(url)
      const json = await response.json()
      commit('setVideoInfo', json)
    },
    startVideoAt({ commit }, time) {
      commit('setVideoStartTime', time)
      commit('setViewMode', ViewMode.PLAYER)
    },
    switchToPlayerMode({ commit }) {
      commit('setViewMode', ViewMode.PLAYER)
    },
    switchToSceneListMode({ commit }) {
      commit('setViewMode', ViewMode.SCENE_LIST)
    },
    toggleViewMode({ commit, state }) {
      if (state.viewMode === ViewMode.PLAYER) {
        commit('setViewMode', ViewMode.SCENE_LIST)
      } else {
        commit('setViewMode', ViewMode.PLAYER)
      }
    },
  }
})

export default store