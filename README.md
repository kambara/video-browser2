## Install

### Prerequirements

- Node.js
- FFmpeg
- Redis
- Yarn

## Config

    cd backend
    cp config/default.yaml.sample config/default.yaml
    vi config/default.yaml

## Production

Setup:

    cd backend
    yarn install
    yarn global add pm2

Run:

    yarn start

Run as a service:

    sudo pm2 start src/main.js --name video-browser2

Setup a startup script:

    sudo pm2 startup
    sudo pm2 save

## Development

### Backend

Setup:

    cd backend
    yarn install

Run:

    DEBUG=video-browser2:* yarn start:dev

Kue Dashboard:

    yarn run kue-dashboard -p 3001

### Frontend

Setup:

    cd frontend
    yarn install

Run:

    yarn serve

Build:

    yarn build

## TODO

優先度中

- 10秒スキップ
- レジューム再生
- シーク直後にサムネイルをposter表示
- シークバーサムネイル
- タッチ操作

優先度低

- 次の動画に進む
- サムネイル進捗表示
- キーフレーム抽出
- 最近追加されたもの一覧
- お気に入り
