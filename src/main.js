import Vue from 'vue'
import VueRouter from 'vue-router'
import VideoList from './VideoList'
import Video from './Video'

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
  router: router
}).$mount('#app')