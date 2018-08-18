
## Install

### Prerequirements

- Node.js
- FFmpeg
- Yarn

### Install

    npm install -g nodemon
    yarn install

## Config

    cp config/default.json.sample config/default.json
    vi config/default.json

## Run

### Dev mode

    DEBUG=video-browser2:* npm run dev

In order to enable livereload, install browser extension

- [Chrome](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/remotelivereload/)

### Production mode

TBD

## TODO

優先度高

- Webpack
    - LiveReload
    - Lint
- pug
- 一覧のサムネイル表示
- 動画領域をより大きくする
- サムネイルリストから再生

優先度中

- シークバーサムネイル
- ランダム表示
- 検索

優先度低

- サムネイル進捗表示
