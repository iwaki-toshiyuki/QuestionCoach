# QuestionCoach

AI駆動の質問力向上支援Webアプリ。入力した質問を多角的にスコアリングし、改善フィードバックとリライト例を即時提供します。

## 概要

AIツールの普及により「質問の質」がアウトカムを左右する時代において、誰もが良い質問を作れるよう支援します。

- **質問の可視化**: 具体性・前提情報・目的の明確さ・回答可能性の4観点を0〜100でスコアリング
- **即時リライト**: 入力した質問をAIが自動で書き換え、Before/Afterを比較
- **継続的学習**: 評価・改善サイクルを繰り返すことで質問スキルを段階的に向上

## 技術スタック

| 技術 | バージョン |
|------|-----------|
| Next.js | 14.x (App Router) |
| React | 18.x |
| TypeScript | 5.x |
| Tailwind CSS | 3.x |
| @anthropic-ai/sdk | latest |
| Node.js | v24.11.0 |

## セットアップ

### 前提条件

- Docker（Dev Container利用の場合）
- または Node.js v24.11.0 + npm

### Dev Container経由（推奨）

Visual Studio Codeで「Reopen in Container」を選択すると自動的に環境構築が行われます。

### ローカル環境

```bash
git clone <this-repo> question-coach
cd question-coach
npm install
```

### 環境変数の設定

```bash
cp .env.local.example .env.local
```

`.env.local` を編集して Anthropic API キーを設定します:

```
ANTHROPIC_API_KEY=your_api_key_here
```

### 起動

```bash
npm run dev
```

`http://localhost:3000` にアクセスしてください。

## 使い方

1. テキストエリアに改善したい質問を入力
2. 「評価する」ボタンまたは `Ctrl+Enter` で送信
3. 4観点のスコアと改善フィードバックを確認
4. AIによるリライト例とBefore/After比較を参照
5. 必要に応じてリライト後の質問を再評価

## 開発

```bash
npm run dev      # 開発サーバー起動
npm run build    # プロダクションビルド
npm run test     # テスト実行
npm run lint     # 静的解析
```
