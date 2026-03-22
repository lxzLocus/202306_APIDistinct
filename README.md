# JavaScript API Analyzer

2023年，卒業研究，FOSE2023ポスター発表
JavaScriptコードを解析してHTTPリクエストのモジュールとエンドポイントを特定し、同じエンドポイントを利用しているプログラムを推薦するツールです。

## 概要

このプロジェクトは、Esprimaを使用してJavaScript/Google Apps ScriptコードをASTに変換し、HTTPリクエストモジュール（`node-fetch`, `axios`など）とそのエンドポイントを自動検出します。検出した情報を基に、同じAPIエンドポイントを使用している類似コードを推薦することができます。

## プロジェクト構成

### 🔧 Esprima_jp/

JavaScriptコード解析のコアプログラム

- **`main.js`** (メインエントリーポイント)
  - JavaScriptファイルをEsprimaでASTに変換
  - analyze.jsを呼び出して解析結果を返す
  - 使用方法: `const main = require('./Esprima_jp/main.js'); main(filePath);`

- **`analyze.js`**
  - ASTを解析してHTTPリクエストモジュールを検出
  - 対応モジュール: `node-fetch`, `axios`
  - エンドポイント（URL）、オプション、パラメータを抽出
  - API_json/API_list.jsonと照合

- **`request.js`** (推薦エントリーポイント)
  - 単一ファイルを解析
  - リポジトリ内で同じエンドポイントを使うコードを検索して推薦
  - 使用方法: `node Esprima_jp/request.js`

- **`metrics.js`**, **`random_metrics.js`**
  - コードメトリクスの計算用スクリプト

### 🛠️ Tools/

バッチ処理とJSON操作のユーティリティ

- **`json_write.js`** (一括解析エントリーポイント)
  - ディレクトリ内の全JSファイルを一括解析
  - 解析結果をJSON形式で保存
  - 既存JSONファイルに対してプロパティを追加・更新

- **`search_json_filter.js`** (検索エントリーポイント)
  - 解析済みJSONファイルから特定条件でファイルを検索
  - 条件: URLあり、エンドポイントあり、fetchメソッドあり

### 📦 VSCode_Extension/api-analize/

VSCode拡張機能として実装

- **`extension.js`** (VSCode拡張エントリーポイント)
  - コマンド: `analyze Scripting Code`
  - ステータスバーに「API整合性」ボタンを表示
  - 現在編集中のファイルを自動解析
  - 同じエンドポイントを使用するファイルをクイックピックで推薦
  - 選択したファイルとの差分表示機能

### 📁 API_json/

APIエンドポイントのリストを格納（JSONファイル）

## エントリーポイント一覧

| ファイル | 用途 | 実行方法 |
|---------|------|---------|
| `Esprima_jp/main.js` | 単一ファイルの解析 | `node` or `require()` |
| `Esprima_jp/request.js` | エンドポイント推薦 | `node Esprima_jp/request.js` |
| `Tools/json_write.js` | 一括解析→JSON保存 | `node Tools/json_write.js` |
| `Tools/search_json_filter.js` | JSON検索 | `node Tools/search_json_filter.js` |
| `VSCode_Extension/api-analize/extension.js` | VSCode拡張 | VSCodeで拡張を読み込み |

## 使用例

### 1. 単一ファイルの解析

```javascript
const main = require('./Esprima_jp/main.js');
const result = main('path/to/your/script.js');
console.log(result);
// 返り値: [url有無, エンドポイント, option有無, option名, method有無, method名, ...]
```

### 2. 同じエンドポイントを使うコードの推薦

```bash
node Esprima_jp/request.js
```

編集中のコードを解析し、同じAPIエンドポイントを使用している類似コードを推薦します。

### 3. ディレクトリ内のJSファイルを一括解析

```bash
node Tools/json_write.js
```

指定したディレクトリ内のすべてのJavaScript/Google Apps Scriptファイルを解析し、結果をJSONに保存します。

### 4. VSCode拡張として使用

1. VSCodeで `VSCode_Extension/api-analize/` を開く
2. F5キーで拡張をデバッグ実行
3. ステータスバーの「API整合性」ボタンをクリック
4. 同じエンドポイントを使用するファイルがクイックピックで表示される

## 必要な依存関係

### Esprima_jp/
```bash
cd Esprima_jp
npm install
# esprima, csv, csv-parser, csv-writer, iconv-lite, stream
```

### VSCode Extension
```bash
cd VSCode_Extension/api-analize
npm install
```

## API_json/API_list.json

解析時に参照するAPIエンドポイントのリストをJSON形式で保存します。

## 対応モジュール

- `node-fetch`
- `axios`
- Google Apps ScriptのUrlFetchApp

## ライセンス

未指定
