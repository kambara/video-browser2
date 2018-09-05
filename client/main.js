import Vue from 'vue'
import VueRouter from 'vue-router'
import store from './stores/store'
import VideoDirPage from './pages/VideoDirPage'
import VideoPage from './pages/VideoPage'
import RandomPage from './pages/RandomPage'
import SearchPage from './pages/SearchPage'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: VideoDirPage,
      alias: '/list/'
    },
    {
      path: '/list/*',
      component: VideoDirPage,
    },
    {
      path: '/video/*',
      component: VideoPage,
    },
    {
      path: '/random',
      component: RandomPage,
    },
    {
      path: '/search/:query',
      name: 'search',
      component: SearchPage
    }
  ]
})

new Vue({
  router,
  store
}).$mount('#app')
