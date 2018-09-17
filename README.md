## Install

### Prerequirements

- Node.js
- FFmpeg
- Redis
- Yarn

### Install

    yarn install
    yarn global add pm2

## Config

    cp config/default.yaml.sample config/default.yaml
    vi config/default.yaml

## Run

    yarn start

Run as a service:

    sudo pm2 start server/bin/www --name video-browser2

Setup a startup script:

    sudo pm2 startup
    sudo pm2 save

## Development

    DEBUG=video-browser2:* yarn run dev

In order to enable livereload, install browser extension for [Chrome](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei) or [Firefox](https://addons.mozilla.org/en-US/firefox/addon/remotelivereload/)

Just webpack:

    yarn run webpack

Kue Dashboard:

    yarn run kue-dashboard -p 3001

## TODO

優先度中

- シーク直後にサムネイルをposter表示
- シークバーサムネイル
- タッチ操作

優先度低

- 代表画像の抽出
- 次の動画に進む
- サムネイル進捗表示
- キーフレーム抽出
- 最近追加されたもの一覧
- お気に入り
