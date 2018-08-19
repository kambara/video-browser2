
## Install

### Prerequirements

- Node.js
- FFmpeg
- Yarn

### Install

    yarn install

## Config

    cp config/default.json.sample config/default.json
    vi config/default.json

## Run

### Dev mode

    DEBUG=video-browser2:* yarn run dev

In order to enable livereload, install browser extension:

- [Chrome](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/remotelivereload/)

Just webpack:

    yarn run webpack

### Production mode

TBD

## TODO

優先度高

- Videoから戻るボタン
- 一覧のサムネイル表示
- サムネイルリストから再生
- 時間表示

優先度中

- シークバーサムネイル
- ランダム表示
- 検索

優先度低

- サムネイル進捗表示
