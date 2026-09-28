# GitHub で導入する手順（わたしの美術館）

iPhone のホーム画面に追加するには **https のURL** が必要です。GitHub Pages を使うと、
無料で https のURLが手に入り、しかもPWA（オフライン起動する単体アプリ）として動きます。

---

## 準備：どちらの方法でアップするか

| 方法 | 向いている人 | 必要なもの |
|---|---|---|
| A. ブラウザだけで完結 | ターミナルを触りたくない | GitHubアカウントのみ |
| B. git コマンド | 手元でファイルを管理したい | git（または gh） |

どちらでも出来上がるものは同じです。

---

## 手順1：リポジトリを作る

1. GitHub にログインし、右上の **＋ → New repository**
2. **Repository name** に好きな名前を入れます（例：`bikan-museum`）
3. **Visibility** を選びます
   - 無料プランなら **Public** を選ぶ必要があります（Private でPagesを使うにはPro以上）
   - 公開でも、あなたが保存した写真や言葉は公開されません。それらは端末の中と
     あなたのGoogleドライブにだけ保管され、公開されるのはアプリのプログラムだけです
4. **Create repository** を押します

---

## 手順2：ファイルを置く

### 方法A：ブラウザから

1. 作ったリポジトリで **Add file → Upload files**
2. このフォルダの中身を**全部**アップロードします（フォルダごとではなく中身を）
   - `index.html`
   - `manifest.webmanifest`
   - `sw.js`
   - `.nojekyll`
   - `icons/`（フォルダごと）
   - `README.txt` / `README-GitHub.md`（任意）
3. 下の **Commit changes** を押します

> 注意：`index.html` は必ずリポジトリの**いちばん上**に置いてください。
> サブフォルダの中に入れると、URLの末尾にそのフォルダ名が必要になり、
> URLの階層が1つ深くなります（動きますが、URLが長くなります）。

### 方法B：git コマンドから

```bash
cd bikan-pwa
git init
git add .
git commit -m "わたしの美術館 — はじめての設置"
git branch -M main
git remote add origin https://github.com/<あなたのユーザー名>/bikan-museum.git
git push -u origin main
```

---

## 手順3：GitHub Pages を有効にする

1. リポジトリの **Settings**（設定）を開く
2. 左サイドバーの **Pages** をクリック
3. **Build and deployment** の **Source** で **Deploy from a branch** を選ぶ
4. **Branch** で `main` を、フォルダで `/(root)` を選び、**Save**
5. 数分待つと上のほうに **Visit site** が出ます。押すと
   `https://<あなたのユーザー名>.github.io/bikan-museum/` が開きます

反映まで最大10分かかることがあります。すぐ404でも少し待って再読み込みしてください。

---

## 手順4：スマホのホーム画面に追加

**iPhone / Safari**
1. 上の URL を Safari で開く（Chrome for iOS では追加できません）
2. 下中央の **共有ボタン**（□に↑）→ **ホーム画面に追加** → **追加**
3. ホーム画面に金の額縁のアイコンができます

**Android / Chrome**
1. URLを開くと下にインストールの案内が出ます
2. 出ない場合は右上 **⋮ → アプリをインストール** / **ホーム画面に追加**
3. アプリ内の「設定と保管」からも追加できます

---

## 手順5：Googleドライブと繋ぐ（複数端末で同じ美術館にする）

アプリ内 **設定と保管 → Google ドライブと同期する** の手順に従います。

1. Google Cloud で **Google Drive API** を有効化
2. OAuth 同意画面を作る（テストユーザーに自分のアドレスを追加）
3. **認証情報 → OAuth クライアントID**、種類は**ウェブアプリケーション**
4. **承認済みの JavaScript 生成元** に、あなたの Pages のURLの**ドメイン部分**を追加
   - `https://<あなたのユーザー名>.github.io`（末尾のスラッシュは入れない）
   - パス（`/bikan-museum/`）は入れません
5. 発行されたクライアントIDをアプリに貼り付けて「ドライブに接続」

---

## 更新したいとき

ファイルを差し替えて **Commit changes**（または `git push`）するだけです。
アプリ側は次回起動時に新しい版を見つけて「新しい版に更新」ボタンを出します。

---

## うまくいかないとき

| 症状 | 確認すること |
|---|---|
| 404 になる | `index.html` がリポジトリの最上にありますか。Pagesの Branch が `main` / `/(root)` ですか |
| インストールの案内が出ない | 開いているURLが `https://` ですか。`file://` では追加できません |
| アイコンが化ける | `icons/` フォルダを忘れていませんか |
| 更新が反映されない | 反映まで最大10分。アプリの「新しい版に更新」も押してみてください |
| 保存したものが消えた | 端末のブラウザデータ消去で消えます。ドライブ同期か書き出しで守ってください |
