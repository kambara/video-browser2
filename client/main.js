import Vue from 'vue'
import VueRouter from 'vue-router'
import store from './store'
import VideoList from './components/VideoList'
import Video from './components/Video'
import Random from './components/Random'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: VideoList,
      alias: '/list/'
    },
    {
      path: '/list/*',
      component: VideoList,
    },
    {
      path: '/video/*',
      component: Video,
    },
    {
      path: '/random',
      component: Random,
    }
  ]
})

new Vue({
  router,
  store
}).$mount('#app')
