## Install

### Prerequirements

- Node.js
- FFmpeg
- Redis
- Yarn

### Install

    yarn install

## Config

    cp config/default.yaml.sample config/default.yaml
    vi config/default.yaml

## Run

### Dev mode

    DEBUG=video-browser2:* yarn run dev

In order to enable livereload, install browser extension for [Chrome](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei) or [Firefox](https://addons.mozilla.org/en-US/firefox/addon/remotelivereload/)

#### Just webpack

    yarn run webpack

#### Kue Dashboard

    yarn run kue-dashboard -p 3001

### Production mode

    yarn start

## TODO

優先度高

- /create-thumbnails はPOSTに
- 検索
- ランダム表示

優先度中

- VAAPI対応
- シーク直後にサムネイルをposter表示
- シークバーサムネイル
- タッチ操作
- ダウンロード

優先度低

- 次の動画に進む
- サムネイル進捗表示
- キーフレーム抽出
- 最近追加されたもの一覧
- お気に入り
