import Vue from 'vue'
import Vuex from 'vuex'
import VueNativeSock from 'vue-native-websocket'
import { ViewMode } from './enum'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    video: {
      path: null,
      duration: 0,
      startTime: 0,
      spriteImagePath: null,
      sceneInterval: null,
      viewMode: ViewMode.PLAYER,
    },
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
      if (!state.video.duration || !state.video.sceneInterval) {
        return []
      }
      const times = []
      for (let time = 0; time <= state.video.duration; time += state.video.sceneInterval) {
        times.push(time)
      }
      return times
    },
    src: state => {
      if (!state.video.path) {
        return ''
      }
      const sec = Math.floor(state.video.startTime / 1000)
      return `/api/video/file/${state.video.path}?time=${sec}`
    }
  },
  mutations: {
    setVideoPath(state, path) {
      state.video.path = path
    },
    setVideoStartTime(state, time) {
      console.log(`Store: setVideoStartTime: ${Math.floor(time/1000)} sec ${Math.floor(time/1000/60)} min`)
      state.video.startTime = time
    },
    setVideoInfo(state, info) {
      state.video.duration = Math.floor(info.duration)
      state.video.sceneInterval = info.interval
      state.video.spriteImagePath = info.spriteImagePath
    },
    setViewMode(state, viewMode) {
      state.video.viewMode = viewMode
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
    startVideo({ commit, dispatch }, path) {
      commit('setVideoPath', path)
      commit('setVideoStartTime', 0)
      commit('setViewMode', ViewMode.PLAYER)
      if (path && path.length > 0) {
        dispatch('loadVideoInfo')
      }
    },
    async loadVideoInfo({ commit, state }) {
      const url = `/api/video/info/${state.video.path}`
      const response = await fetch(url)
      const json = await response.json()
      commit('setVideoInfo', json)
    },
    startVideoAt({ commit }, time) {
      commit('setVideoStartTime', time)
    },
    switchToPlayerMode({ commit }) {
      commit('setViewMode', ViewMode.PLAYER)
    },
    switchToSceneListMode({ commit }) {
      commit('setViewMode', ViewMode.SCENE_LIST)
    },
    toggleViewMode({ commit, state }) {
      if (state.video.viewMode === ViewMode.PLAYER) {
        commit('setViewMode', ViewMode.SCENE_LIST)
      } else {
        commit('setViewMode', ViewMode.PLAYER)
      }
    },
  }
})

async function initWebSocket() {
  const wsPort = await getWebSocketPort()
  Vue.use(VueNativeSock, `ws://${location.hostname}:${wsPort}/`, {
    store: store,
    format: 'json',
    reconnection: true,
    reconnectionDelay: 10000,
  })
}

async function getWebSocketPort() {
  const response = await fetch('/api/websocket-port')
  const json = await response.json()
  return json.port
}

initWebSocket()

export default store