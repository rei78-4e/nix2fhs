# nix2fhs

Nix のパス（`/nix/store/<hash>-<name>/...` など）を FHS 形式のパス（`/usr/...`）に書き換える Cloudflare Worker。

エンドポイント: `https://n2f.rei78.cc`

## 使い方

### GET（パスを1つ変換）

```sh
curl 'https://n2f.rei78.cc/?p=/nix/store/abcdefghijklmnopqrstuvwxyz012345-bash-5.2/bin/bash'
# => /usr/bin/bash
```

`p` は URL エンコードが必要な場合があるため、`-G --data-urlencode` を使うと安全です。

```sh
curl -G https://n2f.rei78.cc --data-urlencode "p=$(which bash)"
```

### POST（テキスト全体を変換）

`Content-Type: text/plain` が必須です。改行を保つため `--data-binary` を使います。

```sh
# ファイル
curl -X POST https://n2f.rei78.cc -H 'Content-Type: text/plain' --data-binary @error.log

# stdin
ldd "$(which bash)" | curl -X POST https://n2f.rei78.cc -H 'Content-Type: text/plain' --data-binary @-
```

### ラッパースクリプト `n2f`

```sh
./n2f /nix/store/abcdefghijklmnopqrstuvwxyz012345-bash-5.2/bin/bash   # GET（引数ごと）
ldd "$(which bash)" | ./n2f                                            # POST（stdin）
```

接続先は環境変数 `N2F_URL` で変更できます（デフォルト: `https://n2f.rei78.cc`）。

### ローカル実行（npx）

API を使わず、手元の Node.js（18 以上）で変換します。

```sh
npx github:rei78-4e/nix2fhs /nix/store/abcdefghijklmnopqrstuvwxyz012345-bash-5.2/bin/bash
ldd "$(which bash)" | npx github:rei78-4e/nix2fhs
```

npm に公開済みの場合は `npx nix2fhs ...` で実行できます。変換ロジックは `src/fhs.js` にあり、Worker と CLI で共有しています。

## 変換ルール

| 入力 | 出力 |
|---|---|
| `/nix/store/<hash>-<name>/...` | `/usr/...` |
| `/run/current-system/sw/...` | `/usr/...` |
| `/run/wrappers/...` | `/usr/...` |
| `/etc/profiles/per-user/<user>/...` | `/usr/...` |
| `/nix/var/nix/profiles/<name>/...` | `/usr/...` |
| `/home/<user>/.nix-profile/...` | `/usr/...` |
| `/home/<user>/.local/state/nix/profiles/<name>/...` | `/usr/...` |
| 上記の後続パスが `/etc/...` の場合 | `/etc/...` |

## エラー

| ステータス | 条件 |
|---|---|
| 400 | GET で `p` が無い |
| 405 | GET / POST 以外のメソッド |
| 415 | POST で `Content-Type` が `text/plain` でない |

## テスト

```sh
npm test
```

依存パッケージは不要です（Node.js 組み込みの `node:test` を使用）。

## デプロイ

```sh
npx wrangler deploy
```
