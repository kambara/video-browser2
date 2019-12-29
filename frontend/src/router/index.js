import Vue from 'vue'
import VueRouter from 'vue-router'
import VideoDirPage from '../views/VideoDirPage'
import VideoPage from '../views/VideoPage'
import RandomPage from '../views/RandomPage'
import SearchPage from '../views/SearchPage'

Vue.use(VueRouter)

const routes = [

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

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
