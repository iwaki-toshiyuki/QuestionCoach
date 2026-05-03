# リポジトリ構造定義書 (Repository Structure Document)

## プロジェクト構造

```
question-coach/
├── src/
│   ├── app/                        # Next.js App Router (UIレイヤー + APIレイヤー)
│   │   ├── layout.tsx              # ルートレイアウト
│   │   ├── page.tsx                # トップページ (UIエントリポイント)
│   │   ├── api/
│   │   │   └── evaluate/
│   │   │       └── route.ts        # POST /api/evaluate (APIレイヤー)
│   │   └── _components/            # ページ専用コンポーネント
│   │       ├── QuestionInput.tsx
│   │       ├── ScoreDisplay.tsx
│   │       ├── FeedbackSection.tsx
│   │       ├── RewriteSection.tsx
│   │       └── BeforeAfterComparison.tsx
│   └── lib/                        # サービス・ユーティリティ
│       ├── services/
│       │   └── EvaluationService.ts  # Claude API 呼び出し・スコア計算
│       ├── types/
│       │   └── evaluation.ts         # 共通型定義 (EvaluationRequest, EvaluationResult 等)
│       └── validators/
│           └── question.ts           # 質問バリデーション関数
├── tests/
│   ├── unit/
│   │   ├── lib/services/
│   │   │   └── EvaluationService.test.ts
│   │   └── lib/validators/
│   │       └── question.test.ts
│   └── integration/
│       └── api/
│           └── evaluate.test.ts
├── docs/                            # 永続的ドキュメント
│   ├── ideas/
│   │   └── initial-requirements.md
│   ├── product-requirements.md
│   ├── functional-design.md
│   ├── architecture.md
│   ├── repository-structure.md      # 本ドキュメント
│   ├── development-guidelines.md
│   └── glossary.md
├── .devcontainer/                   # devcontainer 設定
│   └── devcontainer.json
├── .github/
│   └── workflows/
│       └── ci.yml                   # GitHub Actions CI
├── .steering/                       # 作業単位のドキュメント (git 管理下)
│   └── [YYYYMMDD]-[task-name]/
│       ├── requirements.md
│       ├── design.md
│       └── tasklist.md
├── .claude/                         # Claude Code 設定
│   ├── skills/
│   └── settings.json
├── public/                          # 静的アセット (ファビコン・OGP画像等)
├── .env.local                       # 環境変数 (git 除外)
├── .env.local.example               # 環境変数テンプレート (git 管理)
├── .gitignore
├── .prettierrc
├── eslint.config.mjs
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

---

## ディレクトリ詳細

### `src/app/` (UIレイヤー + APIレイヤー)

Next.js App Router の規約に従い、ページ・レイアウト・API Route を配置する。

#### `src/app/page.tsx`

**役割**: トップページ。質問入力から結果表示までの状態管理を担う Client Component。

**配置ファイル**:
- `page.tsx`: メインページコンポーネント。`useState` で `idle` / `loading` / `results` / `error` を管理

**命名規則**:
- Next.js の規約に従い `page.tsx` 固定

**依存関係**:
- 依存可能: `_components/`, `lib/types/`
- 依存禁止: `lib/services/`（サービスはAPIルート経由のみ）

---

#### `src/app/_components/` (UIコンポーネント)

**役割**: ページ専用のUIコンポーネント群。`_` プレフィックスにより Next.js のルーティング対象外とする。

**配置ファイル**:
- `QuestionInput.tsx`: テキストエリア + 送信ボタン + バリデーション表示
- `ScoreDisplay.tsx`: 4観点スコア + 総合スコアのカード表示
- `FeedbackSection.tsx`: 観点別フィードバック + 総合サマリー
- `RewriteSection.tsx`: リライト後の質問 + コピーボタン
- `BeforeAfterComparison.tsx`: Before/After の2カラム比較表示

**命名規則**:
- PascalCase + 役割を表す名詞
- ファイル名 = コンポーネント名

**依存関係**:
- 依存可能: `lib/types/`
- 依存禁止: `lib/services/`（APIキーが含まれるため）

---

#### `src/app/api/evaluate/route.ts` (APIレイヤー)

**役割**: `POST /api/evaluate` のハンドラー。リクエスト検証・サービス呼び出し・レスポンス整形を担う。

**命名規則**:
- Next.js の規約に従い `route.ts` 固定

**依存関係**:
- 依存可能: `lib/services/`, `lib/types/`, `lib/validators/`
- 依存禁止: `app/_components/`（UIコンポーネントへの依存不可）

---

### `src/lib/` (サービス・共通ロジック)

ビジネスロジック・型定義・バリデーションを配置する。`app/` から独立しており、テストしやすい純粋な関数・クラスとする。

#### `src/lib/services/`

**役割**: Claude API 呼び出し・スコア計算などのビジネスロジック。

**配置ファイル**:
- `EvaluationService.ts`: プロンプト構築・Claude API 呼び出し・JSONパース・総合スコア計算

**命名規則**:
- PascalCase + `Service` 接尾辞

**依存関係**:
- 依存可能: `lib/types/`, `@anthropic-ai/sdk`
- 依存禁止: `app/`（UIへの依存不可）

---

#### `src/lib/types/`

**役割**: プロジェクト全体で共有する型定義。

**配置ファイル**:
- `evaluation.ts`: `EvaluationRequest`, `DimensionScore`, `EvaluationResult`, `ErrorResponse` の型定義

**命名規則**:
- kebab-case。ドメイン名で命名

**依存関係**:
- 依存可能: なし（外部ライブラリの型を除く）
- 依存禁止: `services/`（循環依存防止）

---

#### `src/lib/validators/`

**役割**: 入力値バリデーション。UIとAPIルートの両方から呼び出す純粋関数群。

**配置ファイル**:
- `question.ts`: `validateQuestion(q: string): void`（空文字・1000文字超のチェック）

**命名規則**:
- kebab-case。バリデーション対象ドメイン名

**依存関係**:
- 依存可能: `lib/types/`
- 依存禁止: `services/`, `app/`

---

### `tests/` (テストディレクトリ)

#### `tests/unit/`

**役割**: ユニットテスト。外部依存をモックして単体で動作確認する。

**構造**:
```
tests/unit/
└── lib/
    ├── services/
    │   └── EvaluationService.test.ts   # スコア計算・プロンプト生成のテスト
    └── validators/
        └── question.test.ts            # バリデーション関数のテスト
```

**命名規則**: `[テスト対象ファイル名].test.ts`

---

#### `tests/integration/`

**役割**: 統合テスト。Claude API を `msw` でモックし、APIルート全体を検証する。

**構造**:
```
tests/integration/
└── api/
    └── evaluate.test.ts   # POST /api/evaluate の正常系・エラー系
```

---

### `docs/` (永続的ドキュメント)

プロジェクト全体の「何を作るか」「どう作るか」を定義する。頻繁には更新しない。

| ファイル | 役割 |
|---------|------|
| `ideas/initial-requirements.md` | 壁打ち・ブレインストーミングの成果物 |
| `product-requirements.md` | プロダクト要求定義書 (PRD) |
| `functional-design.md` | 機能設計書 |
| `architecture.md` | 技術仕様書 |
| `repository-structure.md` | 本ドキュメント |
| `development-guidelines.md` | 開発ガイドライン |
| `glossary.md` | ユビキタス言語定義 |

---

### `.steering/` (作業単位のドキュメント)

特定の開発作業における「今回何をするか」を定義する。作業ごとに新規作成し履歴として保持する。

```
.steering/
└── 20260503-initial-setup/
    ├── requirements.md   # 今回の作業の要求内容
    ├── design.md         # 変更内容の設計
    └── tasklist.md       # タスクリスト（進捗管理）
```

**命名規則**: `YYYYMMDD-task-name`（例: `20260503-add-score-display`）

---

## ファイル配置規則

### ソースファイル

| ファイル種別 | 配置先 | 命名規則 | 例 |
|------------|--------|---------|-----|
| Next.js ページ | `src/app/` | Next.js 規約 | `page.tsx` |
| APIルート | `src/app/api/[resource]/` | Next.js 規約 | `route.ts` |
| UIコンポーネント | `src/app/_components/` | PascalCase | `ScoreDisplay.tsx` |
| サービスクラス | `src/lib/services/` | PascalCase + `Service` | `EvaluationService.ts` |
| 型定義 | `src/lib/types/` | kebab-case | `evaluation.ts` |
| バリデーション | `src/lib/validators/` | kebab-case | `question.ts` |

### テストファイル

| テスト種別 | 配置先 | 命名規則 | 例 |
|-----------|--------|---------|-----|
| ユニットテスト | `tests/unit/` | `[対象].test.ts` | `EvaluationService.test.ts` |
| 統合テスト | `tests/integration/` | `[機能].test.ts` | `evaluate.test.ts` |

### 設定ファイル

| ファイル | 配置先 | 備考 |
|---------|--------|------|
| `tsconfig.json` | ルート | TypeScript 設定 |
| `next.config.ts` | ルート | Next.js 設定 |
| `tailwind.config.ts` | ルート | Tailwind 設定 |
| `vitest.config.ts` | ルート | テスト設定 |
| `.env.local` | ルート | **git 除外**。`ANTHROPIC_API_KEY` を記載 |
| `.env.local.example` | ルート | git 管理。環境変数のキー名のみ記載 |

---

## 命名規則

### ディレクトリ名
- **レイヤーディレクトリ**: 複数形・kebab-case（例: `services/`, `validators/`）
- **Next.js規約ディレクトリ**: `_` プレフィックスで URLルーティング除外（例: `_components/`）

### ファイル名
- **Reactコンポーネント**: PascalCase（例: `ScoreDisplay.tsx`）
- **サービスクラス**: PascalCase + 役割接尾辞（例: `EvaluationService.ts`）
- **ユーティリティ・バリデーション**: kebab-case（例: `question.ts`）
- **型定義**: kebab-case（例: `evaluation.ts`）

---

## 依存関係のルール

```
UIレイヤー (app/_components/, app/page.tsx)
    ↓ fetch のみ
APIレイヤー (app/api/*/route.ts)
    ↓ 関数呼び出し
サービスレイヤー (lib/services/)
    ↓ SDK 呼び出し
外部API (Anthropic Claude API)
```

**共通参照可能**:
- `lib/types/` と `lib/validators/` は全レイヤーから参照可能

**禁止される依存**:
- `lib/services/` → `app/`（サービスはUIを知らない）
- `app/_components/` → `lib/services/`（APIキー漏洩防止）
- 循環依存全般

---

## 除外設定 (.gitignore)

```
node_modules/
.next/
dist/
.env.local
*.log
.DS_Store
coverage/
```

`.steering/` と `.claude/` は git 管理対象とし、チーム共有する。
