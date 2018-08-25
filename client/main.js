import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import VueNativeSock from 'vue-native-websocket'
import store from './store'
import VideoList from './components/VideoList'
import Video from './components/Video'

Vue.use(Vuex)
Vue.use(VueRouter)
Vue.use(VueNativeSock, `ws://${location.hostname}:3001/`, {
  store: store,
  format: 'json',
  reconnection: true,
  reconnectionDelay: 10000,
})

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: VideoList,
      props: { path: '' }
    },
    {
      path: '/list/*',
      component: VideoList,
      props: route => ({ path: route.params[0] })
    },
    {
      path: '/video/*',
      component: Video,
      props: route => ({ path: route.params[0] })
    }
  ]
})

new Vue({
  router,
  store
}).$mount('#app')