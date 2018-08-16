
## Install

### Prerequirements

- Node.js
- FFmpeg

### npm install

    npm install -g nodemon
    npm install

## Config

    cp config/default.json.sample config/default.json
    vi config/default.json

## Run

    DEBUG=video-browser2:* npm start
    DEBUG=video-browser2:* npm run dev

## TODO

優先度高

- Webpack
    - LiveReload
    - Lint
- 一覧のサムネイル表示
- 動画領域をより大きくする
- サムネイルリストから再生

優先度中

- シークバーサムネイル
- ランダム表示
- 検索

優先度低

- サムネイル進捗表示
