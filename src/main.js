import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import VideoList from './VideoList'
import Video from './Video'
import store from './store'

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
  router: router,
  store
}).$mount('#app')