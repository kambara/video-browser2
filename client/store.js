import Vue from 'vue'
import Vuex from 'vuex'
import { ViewMode } from './enum'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    videoPath: null,
    duration: 0,
    spriteImagePath: null,
    sceneInterval: null,
    videoStartTime: 0,
    viewMode: ViewMode.PLAYER,
    socket: {
      isConnected: false,
      reconnectError: false,
    },
    thumbnailerQueue: {
      title: '',
      progress: 0,
      totalCount: 0,
      completeCount: 0,
      failedCount: 0,
    }
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
      console.log(`Store: setVideoStartTime: ${Math.floor(time/1000)} sec ${Math.floor(time/1000/60)} min`)
      state.videoStartTime = time
    },
    setVideoInfo(state, info) {
      state.duration = Math.floor(info.duration)
      state.sceneInterval = info.interval
      state.spriteImagePath = info.spriteImagePath
    },
    setViewMode(state, viewMode) {
      state.viewMode = viewMode
    },
    SOCKET_THUMBNAILER_PROGRESS(state, info) {
      state.thumbnailerQueue = info.thumbnailerQueue
    },
    SOCKET_THUMBNAILER_COMPLETE(state) {
      console.log('complete')
      state.thumbnailerQueue = {
        title: '',
        progress: 0,
        totalCount: 0,
        completeCount: 0,
      }
    },
    SOCKET_ONOPEN(state) {
      state.socket.isConnected = true
    },
    SOCKET_ONCLOSE(state) {
      state.socket.isConnected = false
      console.warn('WebSocket: closed')
    },
    SOCKET_RECONNECT() {
      console.info('WebSocket: reconnected')
    },
    SOCKET_RECONNECT_ERROR(state) {
      state.socket.reconnectError = true
      console.error('WebSocket: unable to reconnect')
    },
    SOCKET_ONERROR ()  {
      console.error('WebSocket: unable to connect')
    },
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