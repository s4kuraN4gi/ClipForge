# Picavel Lightsail デプロイ手順

## 前提条件

- AWS Lightsail (Ubuntu, 4GB RAM)
- Docker + Docker Compose インストール済み
- 既存構成: nginx-proxy + rentscope-web + lolcoachai-web + tileserver
- Cloudflare で picavel.com の DNS 管理
- GitHub Container Registry (GHCR) にイメージをpush済み

---

## 1. Cloudflare 設定

### 1-1. DNS レコード追加

Cloudflare ダッシュボード → picavel.com → DNS:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | @ | (LightsailのパブリックIP) | Proxied (オレンジ雲) |

### 1-2. SSL/TLS モード

**SSL/TLS → Overview → Full (Strict)** に設定。

> ⚠️ 「Flexible」だと Cloudflare→Lightsail 間が平文通信になり中間者攻撃に脆弱。

### 1-3. Origin Certificate 発行

SSL/TLS → Origin Server → Create Certificate:

- Hostnames: `picavel.com`, `*.picavel.com`
- Validity: 15 years
- Key Format: PEM

生成された証明書と秘密鍵を控えておく。

### 1-4. Page Rules（API キャッシュ防止）

Rules → Page Rules → Create Page Rule:

- URL: `picavel.com/api/*`
- Setting: **Cache Level = Bypass**

> nginx 側でも Cache-Control を設定しているが、二重防護として Cloudflare 側でも設定。

---

## 2. Lightsail 側の準備

### 2-1. proxy ネットワーク作成（初回のみ）

既存コンテナが `rentscope_rentscope-network` を使っている場合、
共有プロキシ用の外部ネットワークを作成する:

```bash
docker network create proxy
```

既存の nginx-proxy と rentscope のコンテナもこのネットワークに接続:

```bash
docker network connect proxy nginx-proxy
```

### 2-2. Origin Certificate 配置

```bash
# Cloudflare で発行した証明書を保存
sudo nano /home/masamizu/rentscope/nginx/certs/picavel-origin.pem
# → 証明書を貼り付け

sudo nano /home/masamizu/rentscope/nginx/certs/picavel-origin.key
# → 秘密鍵を貼り付け

# パーミッション設定
chmod 644 /home/masamizu/rentscope/nginx/certs/picavel-origin.pem
chmod 600 /home/masamizu/rentscope/nginx/certs/picavel-origin.key
```

### 2-3. nginx 設定追加

```bash
# picavel.conf をコピー（リポジトリの deploy/nginx/picavel.conf）
cp picavel.conf /home/masamizu/rentscope/nginx/conf.d/picavel.conf

# nginx をリロード
docker exec nginx-proxy nginx -t
docker exec nginx-proxy nginx -s reload
```

### 2-4. Lightsail ファイアウォール確認

Lightsail コンソール → Networking → Firewall:

| Application | Protocol | Port |
|------------|----------|------|
| HTTP | TCP | 80 |
| HTTPS | TCP | 443 |

（既に開放済みのはず）

---

## 3. Picavel デプロイ

### 3-1. ディレクトリ作成

```bash
mkdir -p /home/masamizu/picavel
cd /home/masamizu/picavel
```

### 3-2. docker-compose.yml 配置

リポジトリの `docker-compose.yml` をコピー。

### 3-3. 環境変数ファイル作成

```bash
nano .env.production
```

以下の変数を設定:

```env
# Supabase
SUPABASE_SERVICE_ROLE_KEY=...

# Stripe
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_PRICE_PRO_BASE=...
STRIPE_PRICE_PRO_METERED=...
STRIPE_METER_EVENT_NAME=...

# WaveSpeed AI
WAVESPEED_API_KEY=...

# Upstash Redis（レートリミット）
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Sentry
SENTRY_DSN=...

# NEXT_PUBLIC_* はビルド時にインライン化済みのため不要
```

### 3-4. GHCR ログイン & 起動

```bash
# GitHub Container Registry にログイン
echo $GHCR_TOKEN | docker login ghcr.io -u s4kuraNagi --password-stdin

# イメージ取得 & 起動
docker compose pull
docker compose up -d

# ログ確認
docker compose logs -f
```

### 3-5. 動作確認

```bash
# コンテナ状態
docker compose ps

# nginx からアクセスできるか
docker exec nginx-proxy curl -s http://picavel-web:3000 | head -20

# 外部アクセス
curl -I https://picavel.com
```

---

## 4. 更新手順（デプロイ後）

GitHub Actions がイメージをビルド & push した後:

```bash
cd /home/masamizu/picavel
docker compose pull
docker compose up -d
```

---

## 5. トラブルシューティング

### コンテナが起動しない

```bash
docker compose logs picavel-web
```

### nginx が 502 を返す

```bash
# picavel-web が proxy ネットワークに接続されているか
docker network inspect proxy | grep picavel

# nginx の設定テスト
docker exec nginx-proxy nginx -t
```

### メモリ不足

```bash
# メモリ使用量確認
docker stats --no-stream
```

4GB インスタンスで他アプリと同居の場合、Picavel は 1GB 制限で設定済み。

---

## 6. Supabase Free プラン停止防止（crontab）

Supabase Free プランは **7日間無操作で DB が自動停止** される。
Lightsail の crontab でヘルスチェックを設定して防止する。

### 設定手順

```bash
# crontab 編集
crontab -e

# 以下を追記（5分おきにヘルスチェック）
*/5 * * * * curl -sf "https://cjwlqjonquevxpgieasl.supabase.co/rest/v1/" -H "apikey: SUPABASE_ANON_KEY_HERE" -H "Authorization: Bearer SUPABASE_ANON_KEY_HERE" > /dev/null 2>&1
```

> `SUPABASE_ANON_KEY_HERE` を実際の anon key に置き換えてください。

### 確認

```bash
# crontab が登録されたか確認
crontab -l

# 手動で実行してみる（200が返ればOK）
curl -sf -o /dev/null -w "%{http_code}" "https://cjwlqjonquevxpgieasl.supabase.co/rest/v1/" -H "apikey: SUPABASE_ANON_KEY_HERE" -H "Authorization: Bearer SUPABASE_ANON_KEY_HERE"
```
