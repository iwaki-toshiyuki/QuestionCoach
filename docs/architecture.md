# 技術仕様書 (Architecture Design Document)

## テクノロジースタック

### 言語・ランタイム

| 技術 | バージョン |
|------|-----------|
| Node.js | v24.11.0 |
| TypeScript | 5.x |
| npm | 11.x |

### フレームワーク・ライブラリ

| 技術 | バージョン | 用途 | 選定理由 |
|------|-----------|------|----------|
| Next.js | 14.x (App Router) | フルスタックフレームワーク | フロントエンドとAPIルートを1リポジトリに統合でき、APIキーをサーバーサイドのみに隔離しやすい |
| React | 18.x | UIコンポーネント | Next.jsに同梱。Server/Client Componentsを使い分け、不要なJS転送量を削減できる |
| Tailwind CSS | 3.x | スタイリング | ユーティリティクラスでBefore/After比較レイアウトなどを素早く構築。カスタムCSS最小化 |
| @anthropic-ai/sdk | latest | Claude API クライアント | 公式SDKによる型安全な呼び出し。プロンプトキャッシュやエラーハンドリングが組み込み済み |

### 開発ツール

| 技術 | バージョン | 用途 | 選定理由 |
|------|-----------|------|----------|
| ESLint | 9.x | 静的解析 | Next.jsデフォルト設定で設定コストなし |
| Prettier | 3.x | コードフォーマット | TypeScript/TSX/JSONを統一フォーマット |
| Vitest | 1.x | ユニットテスト | ESMネイティブ・高速実行。Next.jsとの相性も良い |

---

## アーキテクチャパターン

### レイヤードアーキテクチャ

```
┌─────────────────────────────────────────────────────┐
│   UIレイヤー (React Components / Next.js Pages)      │
│   ← ユーザー入力の受付、バリデーション、結果表示        │
├─────────────────────────────────────────────────────┤
│   APIレイヤー (Next.js Route Handlers: /api/*)       │
│   ← HTTPリクエスト受付、サービス呼び出し、レスポンス整形 │
├─────────────────────────────────────────────────────┤
│   サービスレイヤー (EvaluationService)                │
│   ← Claude API呼び出し、スコア計算、ビジネスロジック    │
├─────────────────────────────────────────────────────┤
│   外部APIレイヤー (Anthropic Claude API)              │
│   ← 質問評価・フィードバック・リライトの生成            │
└─────────────────────────────────────────────────────┘
```

#### UIレイヤー
- **責務**: テキスト入力・送信、スコア/フィードバック/Before-After表示、エラー表示
- **許可される操作**: `/api/evaluate` への `fetch` 呼び出し
- **禁止される操作**: Claude APIへの直接アクセス、APIキーの保持

#### APIレイヤー
- **責務**: HTTPバリデーション、サービス層の呼び出し、レスポンス整形
- **許可される操作**: `EvaluationService` の呼び出し
- **禁止される操作**: UIコンポーネントへの依存

#### サービスレイヤー
- **責務**: プロンプト構築、Claude API呼び出し、JSONパース、スコア計算
- **許可される操作**: `@anthropic-ai/sdk` の使用
- **禁止される操作**: HTTPレスポンス生成、UIロジックの実装

---

## データ永続化戦略

### ストレージ方式

| データ種別 | ストレージ | フォーマット | 理由 |
|-----------|----------|-------------|------|
| 入力中の質問（一時） | ブラウザ localStorage | 文字列 | ページリロード時の消失防止。サーバー不要でプライバシーリスクなし |
| 評価結果（直前1件） | ブラウザ localStorage | JSON | リロード後も結果を復元できる。永続DBは MVP スコープ外 |
| APIキー | サーバー環境変数 (`.env.local`) | 文字列 | クライアントに露出させないための基本対策 |

### バックアップ戦略

MVP時点では評価結果のサーバーサイド永続化は行わないため、バックアップ戦略は不要。
将来的に履歴機能を実装する場合はDBバックアップ戦略を別途定義する。

---

## パフォーマンス要件

### レスポンスタイム

| 操作 | 目標時間 | 測定環境 |
|------|---------|---------|
| ページ初期表示 | LCP 2秒以内 | 一般的な宅内回線 + 標準ノートPC |
| 評価API (`/api/evaluate`) | 15秒以内 | Claude API 通常応答時 |
| 質問文字数バリデーション（フロント） | 即時（< 16ms） | キー入力ごとにリアルタイム判定 |

### リソース使用量

| リソース | 上限 | 理由 |
|---------|------|------|
| サーバーメモリ（Node.js） | 512MB | Vercel Hobby プランの制限に合わせる |
| Claude API タイムアウト | 30秒 | PRDの15秒目標に余裕を持たせた閾値 |
| クライアント JS バンドル | 200KB (gzip) | 初期表示速度の確保 |

---

## セキュリティアーキテクチャ

### APIキー保護

```
クライアント（ブラウザ）        サーバー（Next.js API Route）
─────────────────────         ──────────────────────────────
POST /api/evaluate            ANTHROPIC_API_KEY = process.env
{ question: "..." }    →      ↓ Claude API 呼び出し（サーバー内のみ）
                              ← EvaluationResult（スコア・テキストのみ）
```

`ANTHROPIC_API_KEY` は `.env.local` で管理し、`NEXT_PUBLIC_` プレフィックスは絶対に使用しない。

### 入力検証

```typescript
// APIルートとUIの両方で実施
function validateQuestion(q: string): void {
  if (!q || q.trim().length === 0) throw new ValidationError('空文字は不可');
  if (q.length > 1000) throw new ValidationError('1000文字以内');
}
```

### XSS 対策

- ユーザー入力および Claude API レスポンスは React の JSX テンプレートでレンダリング
- `dangerouslySetInnerHTML` は使用禁止
- Markdown レンダリングが必要な場合は `remark`/`rehype` のサニタイズパイプラインを使用

---

## スケーラビリティ設計

### データ増加への対応

MVP時点では評価結果の永続化なし。localStorage は端末ローカルのため無制限拡大のリスクなし。

### 機能拡張性

| 将来機能 | 拡張方法 |
|---------|---------|
| 評価履歴保存 | `EvaluationService` の結果を DB 永続化レイヤーに渡す形で拡張。既存 API シグネチャは変更不要 |
| 複数AIモデル対応 | `EvaluationService` にモデルパラメータを追加するだけで対応可能 |
| 認証機能 | Next.js Middleware で JWT 検証レイヤーを追加 |

### APIレートリミット対応

Claude API のレートリミットに達した場合:
1. `@anthropic-ai/sdk` のエラーを `RateLimitError` としてキャッチ
2. フロントエンドに `429 Too Many Requests` を返す
3. クライアントに「しばらくしてから再試行してください」を表示

---

## テスト戦略

### ユニットテスト（Vitest）
- **対象**: `calcTotal()` スコア計算、入力バリデーション関数、`EvaluationService` のプロンプト生成
- **カバレッジ目標**: `src/lib/services/` 90% 以上、`src/lib/validators/` 100%

### 統合テスト
- **方法**: `vitest` + `msw`（Claude API をモック）
- **対象**: `POST /api/evaluate` の正常系・バリデーションエラー・APIエラー

### E2Eテスト（手動）
- 質問入力 → 送信 → スコア/フィードバック/Before-After 表示の確認
- エラー時の再試行フロー確認
- コピーボタン動作確認

---

## 技術的制約

### 環境要件
- **OS**: macOS / Linux / Windows（devcontainer 推奨）
- **Node.js**: v24.11.0
- **必要な外部依存**: Anthropic API キー（`ANTHROPIC_API_KEY`）

### パフォーマンス制約
- Claude API の応答時間はネットワーク・モデル負荷に依存し、15秒を超える場合がある
- MVP ではストリーミング非対応のため、応答完了まで UI はローディング状態

### セキュリティ制約
- `ANTHROPIC_API_KEY` を `.env.local` 外（コード、git など）に記載しない
- ユーザー入力を Claude へ渡す際、プロンプトインジェクション対策として評価用プロンプトテンプレートを固定する

---

## デプロイ構成

### デプロイ先

Vercel（Hobby プラン）を使用する。Next.js との親和性が高く、環境変数管理・プレビューデプロイが標準搭載されている。

### 環境

| 環境 | ブランチ | 用途 |
|------|---------|------|
| 本番 | `main` | 一般公開 |
| プレビュー | Pull Request | レビュー用の一時環境 |
| ローカル | — | `npm run dev` で起動 |

### 環境変数設定手順

**ローカル開発**:
```bash
cp .env.local.example .env.local
# .env.local に ANTHROPIC_API_KEY=sk-ant-... を記載
```

**Vercel 本番・プレビュー**:
1. Vercel ダッシュボード → プロジェクト → Settings → Environment Variables
2. `ANTHROPIC_API_KEY` を Production / Preview 両環境に追加
3. `NEXT_PUBLIC_` プレフィックスは絶対に付けない（クライアント露出防止）

### `.env.local.example`

```
# Anthropic Claude API キー (必須)
# https://console.anthropic.com で取得
ANTHROPIC_API_KEY=
```

---

## 依存関係管理

| ライブラリ | 用途 | バージョン管理方針 |
|-----------|------|-------------------|
| next | フレームワーク | `^14.x`（マイナー自動更新） |
| react / react-dom | UIライブラリ | next に同梱のバージョンに従う |
| tailwindcss | スタイリング | `^3.x` |
| @anthropic-ai/sdk | Claude API クライアント | `^0.x`（メジャーバージョン固定） |
| typescript | 型チェック | `~5.x`（パッチのみ自動） |
| vitest | テスト | `^1.x` |
| eslint | 静的解析 | `^9.x` |
