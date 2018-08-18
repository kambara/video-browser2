import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import store from './store'
import VideoList from './components/VideoList'
import Video from './components/Video'

Vue.use(Vuex)
Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: VideoList
    },
    {
      path: '/list/*',
      component: VideoList
    },
    {
      path: '/video/*',
      component: Video
    }
  ]
})

new Vue({
  router,
  store
}).$mount('#app')