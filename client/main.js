import Vue from 'vue'
import VueRouter from 'vue-router'
import store from './store'
import VideoList from './components/VideoList'
import Video from './components/Video'

Vue.use(VueRouter)

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
