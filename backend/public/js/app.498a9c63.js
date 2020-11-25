(function(t){function e(e){for(var i,a,s=e[0],c=e[1],u=e[2],h=0,d=[];h<s.length;h++)a=s[h],Object.prototype.hasOwnProperty.call(o,a)&&o[a]&&d.push(o[a][0]),o[a]=0;for(i in c)Object.prototype.hasOwnProperty.call(c,i)&&(t[i]=c[i]);l&&l(e);while(d.length)d.shift()();return r.push.apply(r,u||[]),n()}function n(){for(var t,e=0;e<r.length;e++){for(var n=r[e],i=!0,s=1;s<n.length;s++){var c=n[s];0!==o[c]&&(i=!1)}i&&(r.splice(e--,1),t=a(a.s=n[0]))}return t}var i={},o={app:0},r=[];function a(e){if(i[e])return i[e].exports;var n=i[e]={i:e,l:!1,exports:{}};return t[e].call(n.exports,n,n.exports,a),n.l=!0,n.exports}a.m=t,a.c=i,a.d=function(t,e,n){a.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},a.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},a.t=function(t,e){if(1&e&&(t=a(t)),8&e)return t;if(4&e&&"object"===typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(a.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var i in t)a.d(n,i,function(e){return t[e]}.bind(null,i));return n},a.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return a.d(e,"a",e),e},a.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},a.p="/";var s=window["webpackJsonp"]=window["webpackJsonp"]||[],c=s.push.bind(s);s.push=e,s=s.slice();for(var u=0;u<s.length;u++)e(s[u]);var l=c;r.push([0,"chunk-vendors"]),n()})({0:function(t,e,n){t.exports=n("56d7")},"02a2":function(t,e,n){},"034f":function(t,e,n){"use strict";var i=n("85ec"),o=n.n(i);o.a},"0c23":function(t,e,n){"use strict";var i=n("522b"),o=n.n(i);o.a},"522b":function(t,e,n){},"56d7":function(t,e,n){"use strict";n.r(e);n("e260"),n("e6cf"),n("cca6"),n("a79d");var i,o,r=n("2b0e"),a=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{attrs:{id:"app"}},[n("router-view")],1)},s=[],c=(n("034f"),n("2877")),u={},l=Object(c["a"])(u,a,s,!1,null,null,null),h=l.exports,d=n("8c4f"),f=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",[n("list-header"),n("video-list",{ref:"videoList",attrs:{entries:t.entries}}),n("thumbnailer-progress")],1)},p=[],m=(n("99af"),n("d3b7"),n("ddb0"),n("96cf"),n("1da1")),v=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("nav",[n("div",{staticClass:"top"},[n("button",{on:{click:t.onRandomButtonClick}},[t._v("Random")]),n("button",{on:{click:t.onCreateThumbnailsButtonClick}},[t._v("Create Thumbnails")]),n("button",{on:{click:t.onRecursiveButtonClick}},[t._v("Recursive")])]),n("div",{staticClass:"bottom"},[n("div",{staticClass:"left"},[null!=t.parent(t.path)?n("router-link",{staticClass:"back-button",attrs:{to:t.linkToParentList(t.path)}},[n("i",{staticClass:"material-icons"},[t._v("arrow_back")])]):t._e(),t.path?n("h1",[t._v(t._s(t.basename(t.path)))]):n("h1",[t._v("VIDEO BROWSER")])],1),n("div",{staticClass:"right"},[n("input",{staticClass:"search",attrs:{placeholder:"Search"},on:{change:t.onSearchInputChange,keydown:function(t){t.stopPropagation()}}})])])])},g=[],b=(n("a15b"),n("ac1f"),n("5319"),n("1276"),n("498a"),{methods:{basename:function(t){return t=t.trim().replace(/\/$/,""),t.split("/").pop()},parent:function(t){if(t=t.trim().replace(/\/$/,""),0===t.length)return null;var e=t.split("/");return e.pop(),e.join("/")},linkToParentList:function(t){return this.linkToList(this.parent(t))},linkToList:function(t){return"/list/".concat(t)},linkToVideo:function(t){return"/video/".concat(t)}}}),y=b,C=Object(c["a"])(y,i,o,!1,null,null,null),w=C.exports,T={mixins:[w],computed:{path:function(){return this.$route.params.pathMatch||""}},mounted:function(){window.addEventListener("keydown",this.onKeydown)},beforeDestroy:function(){window.removeEventListener("keydown",this.onKeydown)},methods:{onCreateThumbnailsButtonClick:function(){var t=Object(m["a"])(regeneratorRuntime.mark((function t(){var e,n;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return t.next=2,fetch("/api/dir/thumbnails/create/".concat(this.path),{method:"POST"});case 2:return e=t.sent,t.next=5,e.json();case 5:n=t.sent,console.log("Job count:",n.jobCount);case 7:case"end":return t.stop()}}),t,this)})));function e(){return t.apply(this,arguments)}return e}(),onRecursiveButtonClick:function(){var t=Object(m["a"])(regeneratorRuntime.mark((function t(){var e,n;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return t.next=2,fetch("/api/dir/thumbnails/create-recursive/".concat(this.path),{method:"POST"});case 2:return e=t.sent,t.next=5,e.json();case 5:n=t.sent,console.log("Job count:",n.jobCount);case 7:case"end":return t.stop()}}),t,this)})));function e(){return t.apply(this,arguments)}return e}(),onRandomButtonClick:function(){this.$router.push("/random")},onSearchInputChange:function(t){var e=t.currentTarget.value;0!==e.length&&this.$router.push({name:"search",params:{query:e}})},onKeydown:function(t){if(!t.metaKey&&!t.ctrlKey)switch(t.key){case"r":this.$router.push("/random");break}}}},k=T,_=(n("e557"),Object(c["a"])(k,v,g,!1,null,"09eab780",null)),S=_.exports,$=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("ul",t._l(t.entries,(function(e,i){return n("li",{key:i},[n("router-link",{class:e.type,attrs:{to:t.linkToEntry(e)}},[n("div",{staticClass:"scenes"},[e.thumbnailsDir?n("div",t._l(t.highlightImages(e.thumbnailsDir),(function(t,e){return n("img",{attrs:{src:t}})})),0):t._e()]),n("div",{staticClass:"title"},[n("div",{staticClass:"left"},[t._v(t._s(t.basename(e.path)))]),"directory"===e.type?n("i",{staticClass:"material-icons"},[t._v("chevron_right")]):t._e()])])],1)})),0)},M=[],E={mixins:[w],props:{entries:Array},methods:{linkToEntry:function(t){switch(t.type){case"directory":return this.linkToList(t.path);case"video":return this.linkToVideo(t.path)}return""},highlightImages:function(t){for(var e=[],n=0;n<5;n++)e.push("".concat(t,"/").concat(n,".jpg"));return e}}},P=E,L=(n("0c23"),Object(c["a"])(P,$,M,!1,null,"251dbb12",null)),O=L.exports,x=function(){var t=this,e=t.$createElement,n=t._self._c||e;return t.$store.state.thumbnailerQueue.totalCount>0?n("div",{staticClass:"container"},[n("div",{staticClass:"message"},[n("div",{staticClass:"left"},[t._v("Creating thumbnails")]),n("div",{staticClass:"right"},[t._v(t._s(t.$store.state.thumbnailerQueue.completeCount+1)+" / "+t._s(t.$store.state.thumbnailerQueue.totalCount))])]),t.$store.state.thumbnailerQueue.failedCount>0?n("div",{staticClass:"message failed"},[n("div",{staticClass:"left"},[t._v("Failed")]),n("div",{staticClass:"right"},[t._v(t._s(t.$store.state.thumbnailerQueue.failedCount))])]):t._e(),n("div",{staticClass:"video-title"},[t._v(t._s(t.$store.state.thumbnailerQueue.title))]),n("progress",{attrs:{max:"100"},domProps:{value:t.$store.state.thumbnailerQueue.progress}})]):t._e()},R=[],V=n("2f62");r["a"].use(V["a"]);var j,D,I={data:function(){return{}}},A=I,B=(n("68ff"),Object(c["a"])(A,x,R,!1,null,"34d40f04",null)),N=B.exports,K={data:function(){return{entries:[],totalCount:0,offset:0,loading:!1}},computed:{path:function(){return this.$route.params.pathMatch||""}},watch:{$route:function(){this.init(),this.updateEntries()}},created:function(){var t=Object(m["a"])(regeneratorRuntime.mark((function t(){return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:this.init(),this.updateEntries();case 2:case"end":return t.stop()}}),t,this)})));function e(){return t.apply(this,arguments)}return e}(),mounted:function(){window.addEventListener("scroll",this.onScroll)},beforeDestroy:function(){window.removeEventListener("scroll",this.onScroll)},methods:{init:function(){this.entries=[],this.totalCount=0,this.offset=0,this.loading=!1},updateEntries:function(){var t=Object(m["a"])(regeneratorRuntime.mark((function t(){var e,n,i,o,r,a=this;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:if(!this.loading){t.next=2;break}return t.abrupt("return");case 2:if(!(this.totalCount>0&&this.offset>=this.totalCount)){t.next=4;break}return t.abrupt("return");case 4:return this.loading=!0,e=12,t.next=8,fetch("/api/dir/list/".concat(this.path,"?limit=").concat(e,"&offset=").concat(this.offset));case 8:return n=t.sent,t.next=11,n.json();case 11:i=t.sent,o=i.entries,r=i.totalCount,this.entries=this.entries.concat(o),this.totalCount=r,this.offset+=e,setTimeout((function(){a.loading=!1,a.onScroll()}),500);case 18:case"end":return t.stop()}}),t,this)})));function e(){return t.apply(this,arguments)}return e}(),onScroll:function(){if(!this.loading){var t=this.$refs.videoList.$el,e=t.getBoundingClientRect().top,n=e+t.clientHeight;n<=window.innerHeight+200&&this.updateEntries()}}},components:{ListHeader:S,VideoList:O,ThumbnailerProgress:N}},H=K,q=Object(c["a"])(H,f,p,!1,null,"14be0e78",null),Q=q.exports,W=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{on:{mousemove:t.onMouseMove,wheel:t.onWheel}},[n("transition",{attrs:{name:"fade"}},[t.navigationVisibility?n("nav",[n("div",{staticClass:"left"},[n("router-link",{staticClass:"back-button",attrs:{to:t.linkToParentList(t.path)}},[n("i",{staticClass:"material-icons"},[t._v("arrow_back")])]),n("h1",[t._v(t._s(t.basename(t.path)))])],1),n("div",{staticClass:"right"},[n("button",{on:{click:t.onDownloadButtonClick}},[t._v("Download")]),n("button",{on:{click:t.onRandomButtonClick}},[t._v("Random")]),n("button",{on:{click:t.onCreateThumbnailsButtonClick}},[t._v("Create Thumbnails")])])]):t._e()]),n("div",{staticClass:"video-player-and-scene-list-container"},[n("div",{staticClass:"video-player-container",class:[t.playerSizeClass],on:{click:t.onVideoPlayerContainerClick}},[n("video-player")],1),n("div",{ref:"sceneListContainer",staticClass:"scene-list-container",class:[t.playerSizeClass],on:{scroll:t.onSceneListScroll}},[n("scene-list")],1)]),n("thumbnailer-progress")],1)},F=[],G=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"video-container",on:{mousemove:t.onVideoMouseMove}},[n("video",{ref:"video",attrs:{type:"video/mp4",src:t.src,autoplay:t.autoPlay},on:{canplay:t.onVideoCanPlay,loadstart:t.onVideoLoadStart,playing:t.onVideoPlaying,pause:t.onVideoPause,ended:t.onVideoEnded,touchstart:t.onVideoTouchStart,touchmove:t.onVideoTouchMove,touchend:t.onVideoTouchEnd}}),n("transition",{attrs:{name:"fade"}},[t.controlVisibility?n("div",{staticClass:"controls"},[n("input",{staticClass:"seek-bar",attrs:{type:"range",max:t.$store.state.video.duration},domProps:{value:t.currentTimeSec},on:{input:t.onSeekBarInput,change:t.onSeekBarChange,click:function(t){t.stopPropagation()}}}),n("div",{staticClass:"bottom"},[n("div",{staticClass:"left"},[n("button",{staticClass:"play-button",attrs:{disabled:!t.loaded},on:{click:function(e){return e.stopPropagation(),t.onPlayButtonClick(e)}}},[n("i",{staticClass:"material-icons"},[t._v(t._s(t.paused?"play_arrow":"pause"))])]),n("input",{staticClass:"volume",attrs:{type:"range",max:"1",step:"0.01"},domProps:{value:t.volume},on:{input:t.onVolumeInput,click:function(t){t.stopPropagation()}}}),n("span",{staticClass:"time"},[t._v(t._s(t.formatTime(t.currentTimeSec))+" / "+t._s(t.formatTime(t.$store.state.video.duration)))])]),n("div",{staticClass:"right"},[t.fullscreen?t._e():n("button",{on:{click:function(e){return e.stopPropagation(),t.onPlayerModeButtonClick(e)}}},[n("i",{staticClass:"material-icons"},[t._v("view_comfy")])]),n("button",{on:{click:function(e){return e.stopPropagation(),t.onFullscreenButtonClick(e)}}},[n("i",{staticClass:"material-icons"},[t._v(t._s(t.fullscreen?"fullscreen_exit":"fullscreen"))])])])])]):t._e()])],1)},U=[],J=(n("38cf"),n("2b27")),X=n.n(J),z=(n("25f0"),n("4d90"),{methods:{formatTime:function(t){var e=Math.floor(t/60/60),n=Math.floor(t/60)%60,i=t%60,o=i.toString().padStart(2,"0");if(e>0){var r=n.toString().padStart(2,"0"),a=e>=10?e.toString().padStart(2,"0"):e.toString();return"".concat(a,":").concat(r,":").concat(o)}var s=n>=10?n.toString().padStart(2,"0"):n.toString();return"".concat(s,":").concat(o)}}}),Y=z,Z=Object(c["a"])(Y,j,D,!1,null,null,null),tt=Z.exports;r["a"].use(V["a"]),r["a"].use(X.a);var et={mixins:[tt],data:function(){return{loaded_:!1,paused_:!0,autoPlay:!0,currentTime:0,controlVisibility:!0,fullscreen:!1,volume:.5}},computed:{loaded:function(){return this.loaded_},paused:function(){return this.paused_},src:function(){var t=this.$route.params.pathMatch,e=Math.floor(this.$store.state.video.startTime/1e3);return"/api/video/stream/".concat(t,"?time=").concat(e)},currentTimeSec:function(){return Math.floor(this.currentTime/1e3)}},watch:{volume:function(){if(this.$refs.video){var t=this.volume*this.volume;this.$refs.video.volume=t}this.$cookies.set("volume",this.volume,"1Y")},"$store.state.video.startTime":function(){this.currentTime=this.$store.state.video.startTime}},created:function(){var t=Object(m["a"])(regeneratorRuntime.mark((function t(){var e,n=this;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:this.intervalIdOfUpdateTime=setInterval((function(){n.updateTime()}),100),e=this.$cookies.get("volume"),null!=e&&(this.volume=e);case 3:case"end":return t.stop()}}),t,this)})));function e(){return t.apply(this,arguments)}return e}(),mounted:function(){this.hideControlLater(),window.addEventListener("keydown",this.onKeydown)},beforeDestroy:function(){window.removeEventListener("keydown",this.onKeydown),clearInterval(this.intervalIdOfUpdateTime),this.pause(),this.$refs.video&&(this.$refs.video.removeAttribute("src"),this.$refs.video.load())},methods:{play:function(){this.$refs.video&&this.$refs.video.play()},pause:function(){this.$refs.video&&this.$refs.video.pause()},togglePlay:function(){this.paused?this.play():this.pause()},updateTime:function(){this.$refs.video&&!this.paused&&this.lastTime&&(this.currentTime+=Date.now()-this.lastTime),this.lastTime=Date.now()},onVideoLoadStart:function(){this.loaded_=!1},onVideoCanPlay:function(){this.loaded_=!0},onVideoPause:function(t){this.paused_=t.currentTarget.paused,this.showControl()},onVideoPlaying:function(t){this.paused_=t.currentTarget.paused,this.hideControlLater()},onVideoEnded:function(){this.pause()},onVideoMouseMove:function(){this.showAndHideControlLater()},showControl:function(){this.controlVisibility=!0,this.timeoutIdOfHideControl&&clearTimeout(this.timeoutIdOfHideControl)},hideControlLater:function(){var t=this;this.timeoutIdOfHideControl=setTimeout((function(){t.controlVisibility=!1}),4e3)},showAndHideControlLater:function(){this.showControl(),this.paused||this.hideControlLater()},onVideoTouchStart:function(t){this.touchStartX=t.targetTouches[0].clientX,this.touchStartTime=this.currentTime},onVideoTouchMove:function(t){var e=20,n=t.targetTouches[0].clientX-this.touchStartX;if(!(Math.abs(n)<e)){this.seeking||(this.seeking=!0,this.loaded&&(this.autoPlay=!this.paused),this.pause());var i=.2*(n-e*(n/Math.abs(n))),o=this.touchStartTime+1e3*i;this.currentTime=o>=0?o:0}},onVideoTouchEnd:function(){this.seeking&&(this.$store.dispatch("startVideoAt",this.currentTime),this.seeking=!1)},onSeekBarInput:function(t){this.seeking||(this.seeking=!0,this.loaded&&(this.autoPlay=!this.paused),this.pause()),this.currentTime=1e3*t.currentTarget.value},onSeekBarChange:function(t){this.currentTime=1e3*t.currentTarget.value,this.$store.dispatch("startVideoAt",this.currentTime),this.seeking=!1},onPlayButtonClick:function(t){this.togglePlay(),t.currentTarget.blur()},onVolumeInput:function(t){this.volume=t.currentTarget.value},onFullscreenButtonClick:function(t){this.toggleFullscreen(),t.currentTarget.blur()},toggleFullscreen:function(){document.webkitFullscreenElement?(document.webkitExitFullscreen(),this.fullscreen=!1):(document.querySelector(".video-container").webkitRequestFullscreen(),this.fullscreen=!0)},onPlayerModeButtonClick:function(t){this.$store.dispatch("togglePlayerMode"),t.currentTarget.blur()},onKeydown:function(t){if(!t.metaKey&&!t.ctrlKey)switch(t.key){case" ":t.repeat||this.togglePlay();break;case"f":t.repeat||this.toggleFullscreen();break;case"v":t.repeat||this.$store.dispatch("togglePlayerMode");break;case"ArrowRight":this.$store.dispatch("startVideoAt",this.currentTime+1e4),this.showAndHideControlLater();break;case"ArrowLeft":this.$store.dispatch("startVideoAt",this.currentTime-1e4),this.showAndHideControlLater();break;case"ArrowUp":this.$store.dispatch("startVideoAt",this.currentTime+6e4),this.showAndHideControlLater();break;case"ArrowDown":this.$store.dispatch("startVideoAt",this.currentTime-6e4),this.showAndHideControlLater();break}}}},nt=et,it=(n("a0e8"),Object(c["a"])(nt,G,U,!1,null,"1bc56d96",null)),ot=it.exports,rt=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("ul",{staticClass:"thumbnails"},t._l(t.$store.getters.timestamps,(function(e,i){return n("li",{key:i,staticClass:"thumbnail",style:t.thumbnailStyle(i),attrs:{"data-time":e},on:{click:t.onThumbnailClick}},[n("div",{staticClass:"time"},[t._v(t._s(t.formatTime(e)))])])})),0)},at=[];n("e25e");r["a"].use(V["a"]);var st={mixins:[tt],methods:{thumbnailStyle:function(t){var e=t%10*160,n=90*Math.floor(t/10);return"\n        background-image: url(".concat(this.$store.state.video.spriteImagePath,");\n        background-position: -").concat(e,"px -").concat(n,"px;")},onThumbnailClick:function(t){var e=t.currentTarget.getAttribute("data-time"),n=1e3*parseInt(e);isNaN(n)?console.error("time is NaN",e):(this.$store.dispatch("startVideoAt",n),this.$store.dispatch("switchToMiddleMode"))}}},ct=st,ut=(n("6e89"),Object(c["a"])(ct,rt,at,!1,null,"595a988e",null)),lt=ut.exports,ht={SMALL:0,MIDDLE:1,LARGE:2};r["a"].use(V["a"]);var dt={mixins:[w],data:function(){return{navigationVisibility:!0}},computed:{path:function(){return this.$route.params.pathMatch||""},playerSizeClass:function(){switch(this.$store.state.video.playerMode){case ht.SMALL:return"player-small";case ht.MIDDLE:return"player-middle";case ht.LARGE:return"player-large"}return""}},watch:{"$store.state.video.playerMode":function(){this.$store.state.video.playerMode!==ht.LARGE&&this.$refs.sceneListContainer.focus()}},created:function(){this.$store.dispatch("initVideo",this.path)},mounted:function(){this.hideNavigationLater(),window.addEventListener("keydown",this.onKeydown)},methods:{onCreateThumbnailsButtonClick:function(){var t=Object(m["a"])(regeneratorRuntime.mark((function t(){var e,n;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return t.next=2,fetch("/api/video/thumbnails/create/".concat(this.path),{method:"POST"});case 2:return e=t.sent,t.next=5,e.json();case 5:n=t.sent,console.log(n);case 7:case"end":return t.stop()}}),t,this)})));function e(){return t.apply(this,arguments)}return e}(),onRandomButtonClick:function(){this.$router.push("/random")},onVideoPlayerContainerClick:function(){this.$store.state.video.playerMode===ht.SMALL&&this.$store.dispatch("switchToMiddleMode")},onDownloadButtonClick:function(){var t=document.createElement("a");t.href="/api/video/download/".concat(this.path),t.click()},onMouseMove:function(){this.showNavigation(),this.hideNavigationLater()},showNavigation:function(){this.timeoutIdOfHideNavigation&&clearTimeout(this.timeoutIdOfHideNavigation),this.navigationVisibility=!0},hideNavigationLater:function(){var t=this;this.timeoutIdOfHideNavigation=setTimeout((function(){t.navigationVisibility=!1}),4e3)},onWheel:function(t){this.$store.state.video.playerMode===ht.LARGE&&(this.lastWheelTime||(this.lastWheelTime=Date.now()),this.wheelDistance||(this.wheelDistance=0),Date.now()-this.lastWheelTime>500&&(this.wheelDistance=0),this.wheelDistance+=t.deltaY,console.log(this.wheelDistance),Math.abs(this.wheelDistance)>300&&(this.$store.dispatch("switchToMiddleMode"),this.wheelDistance=0),this.lastWheelTime=Date.now())},onSceneListScroll:function(t){this.$store.state.video.playerMode===ht.MIDDLE&&(this.lastScrollTime||(this.lastScrollTime=Date.now()),void 0===this.scrollStartPosition&&(this.scrollStartPosition=0),Date.now()-this.lastScrollTime>500&&(this.scrollStartPosition=t.currentTarget.scrollTop),this.scrollDistance=t.currentTarget.scrollTop-this.scrollStartPosition,console.log(this.scrollDistance),Math.abs(this.scrollDistance)>500&&(console.log("switchToSmallMode"),this.$store.dispatch("switchToSmallMode"),this.scrollStartPosition=t.currentTarget.scrollTop),this.lastScrollTime=Date.now())},onKeydown:function(t){if(!t.metaKey&&!t.ctrlKey)switch(t.key){case"r":this.$router.push("/random");break}}},components:{VideoPlayer:ot,SceneList:lt,ThumbnailerProgress:N}},ft=dt,pt=(n("a6e3"),Object(c["a"])(ft,W,F,!1,null,"5536632f",null)),mt=pt.exports,vt=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div")},gt=[],bt={created:function(){var t=Object(m["a"])(regeneratorRuntime.mark((function t(){var e,n;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return t.next=2,fetch("/api/random");case 2:return e=t.sent,t.next=5,e.json();case 5:n=t.sent,this.$router.replace("/video/".concat(n.path));case 7:case"end":return t.stop()}}),t,this)})));function e(){return t.apply(this,arguments)}return e}()},yt=bt,Ct=Object(c["a"])(yt,vt,gt,!1,null,null,null),wt=Ct.exports,Tt=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",[n("search-header"),n("video-list",{attrs:{entries:t.entries}}),n("thumbnailer-progress")],1)},kt=[],_t=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("nav",[n("div",{staticClass:"bottom"},[n("div",{staticClass:"left"},[n("router-link",{staticClass:"back-button",attrs:{to:t.linkToList("")}},[n("i",{staticClass:"material-icons"},[t._v("arrow_back")])]),n("h1",[t._v(t._s(t.query))])],1),n("div",{staticClass:"right"},[n("input",{staticClass:"search",attrs:{placeholder:"Search"},domProps:{value:t.query},on:{change:t.onSearchInputChange,keydown:function(t){t.stopPropagation()}}})])])])},St=[],$t={mixins:[w],computed:{query:function(){return this.$route.params.query}},methods:{onSearchInputChange:function(t){var e=t.currentTarget.value;0!==e.length&&this.$router.push({name:"search",params:{query:e}})}}},Mt=$t,Et=(n("87d8"),Object(c["a"])(Mt,_t,St,!1,null,"858bf3a0",null)),Pt=Et.exports,Lt={data:function(){return{entries:[]}},computed:{query:function(){return this.$route.params.query}},watch:{$route:function(){this.updateEntries()}},created:function(){var t=Object(m["a"])(regeneratorRuntime.mark((function t(){return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:this.updateEntries();case 1:case"end":return t.stop()}}),t,this)})));function e(){return t.apply(this,arguments)}return e}(),methods:{updateEntries:function(){var t=Object(m["a"])(regeneratorRuntime.mark((function t(){var e;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return t.next=2,fetch("/api/search/".concat(this.query));case 2:return e=t.sent,t.next=5,e.json();case 5:this.entries=t.sent;case 6:case"end":return t.stop()}}),t,this)})));function e(){return t.apply(this,arguments)}return e}()},components:{SearchHeader:Pt,VideoList:O,ThumbnailerProgress:N}},Ot=Lt,xt=Object(c["a"])(Ot,Tt,kt,!1,null,"e6d94a70",null),Rt=xt.exports;r["a"].use(d["a"]);var Vt=[{path:"/",component:Q,alias:"/list/"},{path:"/list/*",component:Q},{path:"/video/*",component:mt},{path:"/random",component:wt},{path:"/search/:query",name:"search",component:Rt}],jt=new d["a"]({mode:"history",routes:Vt}),Dt=jt,It=n("b408"),At=n.n(It);r["a"].use(V["a"]);var Bt=new V["a"].Store({state:{video:{duration:0,startTime:0,spriteImagePath:null,sceneInterval:null,playerMode:ht.MIDDLE},socket:{isConnected:!1,reconnectError:!1},thumbnailerQueue:{title:"",progress:0,totalCount:0,completeCount:0,failedCount:0}},getters:{timestamps:function(t){if(!t.video.duration||!t.video.sceneInterval)return[];for(var e=[],n=0;n<=t.video.duration;n+=t.video.sceneInterval)e.push(n);return e}},mutations:{setVideoStartTime:function(t,e){t.video.startTime=e},setVideoInfo:function(t,e){t.video.duration=Math.floor(e.duration),t.video.sceneInterval=e.interval,t.video.spriteImagePath=e.spriteImagePath},setPlayerMode:function(t,e){t.video.playerMode=e},SOCKET_THUMBNAILER_PROGRESS:function(t,e){t.thumbnailerQueue=e.thumbnailerQueue},SOCKET_THUMBNAILER_COMPLETE:function(t){t.thumbnailerQueue={title:"",progress:0,totalCount:0,completeCount:0}},SOCKET_ONOPEN:function(t){t.socket.isConnected=!0},SOCKET_ONCLOSE:function(t){t.socket.isConnected=!1,console.warn("WebSocket: closed")},SOCKET_RECONNECT:function(){console.info("WebSocket: reconnected")},SOCKET_RECONNECT_ERROR:function(t){t.socket.reconnectError=!0,console.error("WebSocket: unable to reconnect")},SOCKET_ONERROR:function(){console.error("WebSocket: unable to connect")}},actions:{initVideo:function(){var t=Object(m["a"])(regeneratorRuntime.mark((function t(e,n){var i,o,r;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:if(i=e.commit,i("setVideoStartTime",0),i("setPlayerMode",ht.MIDDLE),!(n&&n.length>0)){t.next=11;break}return t.next=6,fetch("/api/video/info/".concat(n));case 6:return o=t.sent,t.next=9,o.json();case 9:r=t.sent,i("setVideoInfo",r);case 11:case"end":return t.stop()}}),t)})));function e(e,n){return t.apply(this,arguments)}return e}(),startVideoAt:function(t,e){var n=t.commit;n("setVideoStartTime",e)},switchToSmallMode:function(t){var e=t.commit;e("setPlayerMode",ht.SMALL)},switchToMiddleMode:function(t){var e=t.commit;e("setPlayerMode",ht.MIDDLE)},switchToLargeMode:function(t){var e=t.commit;e("setPlayerMode",ht.LARGE)},togglePlayerMode:function(t){var e=t.commit,n=t.state;n.video.playerMode===ht.LARGE?e("setPlayerMode",ht.MIDDLE):e("setPlayerMode",ht.LARGE)}}});r["a"].use(At.a,"ws://".concat(location.host,"/ws/"),{store:Bt,format:"json",reconnection:!0,reconnectionDelay:1e4});var Nt=Bt;r["a"].config.productionTip=!0,new r["a"]({router:Dt,store:Nt,render:function(t){return t(h)}}).$mount("#app")},"68ff":function(t,e,n){"use strict";var i=n("98b2"),o=n.n(i);o.a},"6e89":function(t,e,n){"use strict";var i=n("02a2"),o=n.n(i);o.a},"81fe":function(t,e,n){},"85ec":function(t,e,n){},"87d8":function(t,e,n){"use strict";var i=n("e56f"),o=n.n(i);o.a},"880b":function(t,e,n){},"98b2":function(t,e,n){},a0e8:function(t,e,n){"use strict";var i=n("d473"),o=n.n(i);o.a},a6e3:function(t,e,n){"use strict";var i=n("880b"),o=n.n(i);o.a},d473:function(t,e,n){},e557:function(t,e,n){"use strict";var i=n("81fe"),o=n.n(i);o.a},e56f:function(t,e,n){}});
//# sourceMappingURL=app.498a9c63.js.map