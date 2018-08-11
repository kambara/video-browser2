const VideoList = httpVueLoader('/javascripts/VideoList.vue')
const Video = httpVueLoader('/javascripts/Video.vue')

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