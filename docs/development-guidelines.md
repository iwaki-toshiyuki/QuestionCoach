# 開発ガイドライン (Development Guidelines)

## コーディング規約

### 命名規則

#### 変数・関数

```typescript
// ✅ 良い例
const evaluationResult = await fetchEvaluation(question);
function calcTotalScore(scores: DimensionScores): number { }
const isLoading = true;

// ❌ 悪い例
const data = await fetch(q);
function calc(s: any): number { }
```

**原則**:
- 変数: camelCase、名詞または名詞句
- 関数: camelCase、動詞で始める
- 定数: `UPPER_SNAKE_CASE`
- Boolean: `is`, `has`, `should` で始める

#### クラス・インターフェース・型

```typescript
// クラス・サービス: PascalCase + 役割接尾辞
class EvaluationService { }

// インターフェース: PascalCase（I接頭辞なし）
interface EvaluationResult { }
interface DimensionScore { }

// 型エイリアス（ユニオン等）: PascalCase
type ScoreLevel = 'poor' | 'fair' | 'good' | 'excellent';
type EvaluationState = 'idle' | 'loading' | 'results' | 'error';
```

#### Reactコンポーネント

```typescript
// ✅ PascalCase、役割を表す名詞
export function ScoreDisplay({ scores }: ScoreDisplayProps) { }
export function BeforeAfterComparison({ ... }: BeforeAfterComparisonProps) { }

// ✅ Props型名はコンポーネント名 + Props
interface ScoreDisplayProps {
  scores: EvaluationResult['scores'];
}
```

---

### コードフォーマット

- **インデント**: 2スペース（Prettier管理）
- **行の長さ**: 最大100文字
- **セミコロン**: あり
- **クォート**: シングルクォート（JSX属性はダブル）

---

### コメント規約

```typescript
// ✅ 良い例: なぜそうするかを説明
// Claude API は JSON のみを返すよう指示しているが、念のためパース前に前後のテキストを除去する
const jsonStr = response.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');

// ❌ 悪い例: コードを読めばわかる内容
// スコアを計算する
const total = calcTotalScore(scores);
```

**公開関数・クラスには TSDoc を記載**:
```typescript
/**
 * 4観点スコアの加重平均から総合スコアを算出する
 *
 * @param scores - 4つの観点スコアを含むオブジェクト
 * @returns 0〜100 の整数（切り捨て）
 */
function calcTotalScore(scores: EvaluationResult['scores']): number { }
```

---

### 型定義

```typescript
// ✅ 良い例: 明示的な型注釈
async function evaluate(question: string): Promise<EvaluationResult> { }

// ❌ 悪い例: any に頼る
async function evaluate(question: any): Promise<any> { }
```

**インターフェース vs 型エイリアス**:
- 拡張可能なオブジェクト型 → `interface`
- ユニオン型・Tuple・プリミティブの別名 → `type`

---

### エラーハンドリング

**カスタムエラークラス**:
```typescript
class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class ClaudeApiError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'ClaudeApiError';
    this.cause = cause;
  }
}
```

**ハンドリングパターン**:
```typescript
// ✅ 良い例: 種別を判断して処理を分ける
try {
  const result = await evaluationService.evaluate(question);
  return Response.json(result);
} catch (error) {
  if (error instanceof ValidationError) {
    return Response.json({ error: error.message, code: 'VALIDATION_ERROR' }, { status: 400 });
  }
  if (error instanceof ClaudeApiError) {
    return Response.json({ error: '評価に失敗しました', code: 'API_ERROR' }, { status: 502 });
  }
  throw error;  // 予期しないエラーは上位に伝播
}

// ❌ 悪い例: エラーを握りつぶす
try {
  return await evaluationService.evaluate(question);
} catch {
  return null;
}
```

---

### 非同期処理

```typescript
// ✅ async/await を使用
async function fetchEvaluation(question: string): Promise<EvaluationResult> {
  const res = await fetch('/api/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ❌ Promiseチェーンは避ける
function fetchEvaluation(question: string): Promise<EvaluationResult> {
  return fetch('/api/evaluate', { ... })
    .then(res => res.json())
    .catch(err => { throw err; });
}
```

---

### セキュリティ

```typescript
// ✅ 環境変数から読み込む（サーバーサイドのみ）
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) throw new Error('ANTHROPIC_API_KEY が設定されていません');

// ❌ ハードコード厳禁
const apiKey = 'sk-ant-xxxxxxxxxx';  // git にコミットしない！

// ✅ ユーザー入力はバリデーションして使用する
const { question } = await req.json();
validateQuestion(question);  // 空文字・文字数超過チェック

// ❌ dangerouslySetInnerHTML は使用しない
<div dangerouslySetInnerHTML={{ __html: rewrittenQuestion }} />  // NG
<div>{rewrittenQuestion}</div>  // OK (React がエスケープ)
```

---

## Git運用ルール

### ブランチ戦略（Git Flow）

```
main (本番リリース済み)
└── develop (開発統合)
    ├── feature/[機能名]   例: feature/score-display
    ├── fix/[修正内容]     例: fix/copy-button-ios
    └── refactor/[対象]   例: refactor/evaluation-service
```

**ルール**:
- `main` への直接コミット禁止（PRのみ）
- `develop` への直接コミット禁止（PRのみ）
- feature/fix は `develop` から分岐し、`develop` へマージ
- `develop` → `main` は squash merge 推奨

---

### コミットメッセージ規約（Conventional Commits）

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type**:
| type | 用途 |
|------|------|
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `docs` | ドキュメントのみの変更 |
| `style` | フォーマット（コード動作に影響なし） |
| `refactor` | リファクタリング |
| `test` | テスト追加・修正 |
| `chore` | ビルド設定・依存関係更新等 |

**例**:
```
feat(score): スコア観点別フィードバック表示を追加

スコアが80未満の観点に改善提案テキストを表示するようにした。
80以上の観点は「✅ 良好」バッジのみ表示し、テキストを省略する。

Closes #12
```

---

### プルリクエストテンプレート

```markdown
## 変更の種類
- [ ] 新機能 (feat)
- [ ] バグ修正 (fix)
- [ ] リファクタリング (refactor)
- [ ] ドキュメント (docs)
- [ ] その他 (chore)

## 変更内容
### 何を変更したか
[簡潔な説明]

### なぜ変更したか
[背景・理由]

### どのように変更したか
- [変更点1]
- [変更点2]

## テスト
- [ ] ユニットテスト追加
- [ ] 統合テスト追加
- [ ] 手動テスト実施（主要ブラウザで動作確認）

## レビューポイント
[特に見てほしい点]

## 関連Issue
Closes #[番号]
```

---

## テスト戦略

### テストピラミッド

```
       /\
      /E2E\       手動テスト (主要フロー)
     /------\
    / 統合   \     Vitest + msw でAPIルートをテスト
   /----------\
  / ユニット   \   Vitest でサービス・バリデーションをテスト
 /--------------\
```

**カバレッジ目標**:
- `src/lib/services/`: 90% 以上（ビジネスロジックの中核）
- `src/lib/validators/`: 100%（境界値が明確）
- `src/app/_components/`: テスト対象外（手動確認）

---

### テストの書き方（Given-When-Then）

```typescript
describe('validateQuestion', () => {
  it('空文字の場合 ValidationError をスローする', () => {
    // Given
    const emptyQuestion = '';

    // When / Then
    expect(() => validateQuestion(emptyQuestion)).toThrow(ValidationError);
  });

  it('1000文字以内の場合はエラーなし', () => {
    // Given
    const validQuestion = 'a'.repeat(1000);

    // When / Then
    expect(() => validateQuestion(validQuestion)).not.toThrow();
  });

  it('1001文字の場合 ValidationError をスローする', () => {
    // Given
    const tooLong = 'a'.repeat(1001);

    // When / Then
    expect(() => validateQuestion(tooLong)).toThrow(ValidationError);
  });
});
```

**テスト命名パターン**: `[条件]の場合 [期待結果]`

---

### モック・スタブの使用

```typescript
// Anthropic SDK は vi.mock でモック化
import { vi } from 'vitest';
import Anthropic from '@anthropic-ai/sdk';

vi.mock('@anthropic-ai/sdk');

const mockCreate = vi.fn().mockResolvedValue({
  content: [{ text: JSON.stringify(mockEvaluationResult) }],
});
(Anthropic as any).mockImplementation(() => ({
  messages: { create: mockCreate },
}));
```

---

## コードレビュー基準

### レビューポイント

**機能性**:
- [ ] PRDの受け入れ条件を満たしているか
- [ ] バリデーションのエッジケース（空文字・上限文字数）が考慮されているか

**セキュリティ**:
- [ ] `ANTHROPIC_API_KEY` がクライアントに露出していないか
- [ ] `dangerouslySetInnerHTML` を使っていないか
- [ ] ユーザー入力が `validateQuestion` を通過しているか

**可読性**:
- [ ] コンポーネント名・関数名が役割を表しているか
- [ ] 複雑なロジック（プロンプト構築等）にコメントがあるか

**パフォーマンス**:
- [ ] 不要な再レンダリングを引き起こす依存配列の漏れがないか

### レビューコメント形式

```markdown
[必須] APIキー: `process.env.ANTHROPIC_API_KEY` が `NEXT_PUBLIC_` なしで参照されているか確認してください
[推奨] `useCallback` でメモ化するとレンダリング最適化になります
[提案] この処理は `EvaluationService` に移動できそうです
[質問] この `trim()` は何のためですか？
```

---

## 開発環境セットアップ

### 必要なツール

| ツール | バージョン | インストール方法 |
|--------|-----------|-----------------|
| Node.js | v24.11.0 | devcontainer で自動提供 |
| npm | 11.x | Node.js に同梱 |

### セットアップ手順

```bash
# 1. リポジトリのクローン
git clone <URL>
cd question-coach

# 2. 依存関係のインストール
npm install

# 3. 環境変数の設定
cp .env.local.example .env.local
# .env.local に ANTHROPIC_API_KEY を記載

# 4. 開発サーバーの起動
npm run dev
# → http://localhost:3000 でアクセス可能

# 5. テスト実行
npm run test

# 6. 型チェック
npm run typecheck
```

### npm スクリプト一覧

| スクリプト | 内容 |
|-----------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | プロダクションビルド |
| `npm run lint` | ESLint 実行 |
| `npm run typecheck` | `tsc --noEmit` で型チェック |
| `npm run test` | Vitest でテスト実行 |
| `npm run test:coverage` | カバレッジレポート付きテスト |
| `npm run format` | Prettier でフォーマット |

---

## 品質チェックの自動化

### CI（GitHub Actions）

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test
      - run: npm run build
```

### Pre-commit フック（Husky + lint-staged）

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

---

## 実装完了前チェックリスト

- [ ] 命名が明確で一貫している
- [ ] 型注釈が適切に記載されている
- [ ] `ANTHROPIC_API_KEY` がサーバーサイドのみで使用されている
- [ ] `dangerouslySetInnerHTML` を使っていない
- [ ] ユーザー入力にバリデーションが実装されている
- [ ] エラーハンドリングが実装され、握りつぶしていない
- [ ] ユニットテストが追加されている
- [ ] `npm run lint` と `npm run typecheck` がパスする
