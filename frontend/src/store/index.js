import Vue from 'vue'
import Vuex from 'vuex'
import VueNativeSock from 'vue-native-websocket'
import { PlayerMode } from '../enums/enum'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    video: {
      duration: 0,
      startTime: 0,
      spriteImagePath: null,
      sceneInterval: null,
      playerMode: PlayerMode.MIDDLE,
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
  },
  mutations: {
    setVideoStartTime(state, time) {
      state.video.startTime = time
    },
    setVideoInfo(state, info) {
      state.video.duration = Math.floor(info.duration)
      state.video.sceneInterval = info.interval
      state.video.spriteImagePath = info.spriteImagePath
    },
    setPlayerMode(state, playerMode) {
      state.video.playerMode = playerMode
    },
    SOCKET_THUMBNAILER_PROGRESS(state, info) {
      state.thumbnailerQueue = info.thumbnailerQueue
    },
    SOCKET_THUMBNAILER_COMPLETE(state) {
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
    async initVideo({ commit }, path) {
      commit('setVideoStartTime', 0)
      commit('setPlayerMode', PlayerMode.MIDDLE)
      if (path && path.length > 0) {
        const response = await fetch(`/api/video/info/${path}`)
        const json = await response.json()
        commit('setVideoInfo', json)
      }
    },
    startVideoAt({ commit }, time) {
      commit('setVideoStartTime', time)
    },
    //
    // PlayerMode
    //
    switchToSmallMode({ commit }) {
      commit('setPlayerMode', PlayerMode.SMALL)
    },
    switchToMiddleMode({ commit }) {
      commit('setPlayerMode', PlayerMode.MIDDLE)
    },
    switchToLargeMode({ commit }) {
      commit('setPlayerMode', PlayerMode.LARGE)
    },
    togglePlayerMode({ commit, state }) {
      if (state.video.playerMode === PlayerMode.LARGE) {
        commit('setPlayerMode', PlayerMode.MIDDLE)
      } else {
        commit('setPlayerMode', PlayerMode.LARGE)
      }
    },
  }
})

Vue.use(VueNativeSock, `ws://${location.host}/ws/`, {
  store: store,
  format: 'json',
  reconnection: true,
  reconnectionDelay: 10000,
})

export default store