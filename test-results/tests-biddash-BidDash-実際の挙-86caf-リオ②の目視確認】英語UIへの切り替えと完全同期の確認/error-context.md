# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/biddash.spec.js >> BidDash 実際の挙動を目視確認するデモテスト >> 【シナリオ②の目視確認】英語UIへの切り替えと完全同期の確認
- Location: tests/biddash.spec.js:37:5

# Error details

```
TypeError: expect(...).hasText is not a function
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - heading "BidDash 2.4.2" [level=1] [ref=e4]
      - paragraph [ref=e5]: Global Business Communication Engine
    - generic [ref=e6]:
      - button [ref=e7] [cursor=pointer]:
        - img [ref=e8]
      - combobox [ref=e11] [cursor=pointer]:
        - option "🇯🇵 日本語" [selected]
        - option "🇺🇸 ENGLISH"
        - option "🇨🇳 中文"
  - main [ref=e12]:
    - generic [ref=e14]:
      - generic [ref=e15]:
        - generic [ref=e16]: 1. 案件募集文 / 受信メッセージ
        - textbox "ターゲットのメッセージを貼り付けてください..." [ref=e17]
      - generic [ref=e18]:
        - generic [ref=e19] [cursor=pointer]:
          - generic [ref=e20]: スキルデータベース
          - generic [ref=e21]: ▼
        - generic [ref=e22]: 案件固有の自動マッチング資産はありません。
      - generic [ref=e23]:
        - generic [ref=e24]: 2. 戦略 / 追加条件（自由入力）
        - textbox "納期短縮の交渉、環境のアピールなど自由に入力..." [ref=e25]
      - button "提案文を爆速で生成する" [ref=e26] [cursor=pointer]
    - generic [ref=e28]:
      - generic [ref=e30]: 生成された最強の提案書
      - paragraph [ref=e33]: パラメーターの入力を待っています...
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('BidDash 実際の挙動を目視確認するデモテスト', () => {
  4  | 
  5  |     test.beforeEach(async ({ page }) => {
  6  |         // テスト開始前に、Aoruさんのプロフィール（初期スキル）をlocalStorageに注入
  7  |         await page.addInitScript(() => {
  8  |             const mockSkills = [
  9  |                 { id: "s1", name: "React", keywords: ["react"], achievement: "コンポーネント設計・Hooksを用いた開発が可能です。" },
  10 |                 { id: "s2", name: "Tailwind CSS", keywords: ["tailwind", "css", "responsive"], achievement: "モバイルファーストのレスポンシブUIを高速で構築できます。" },
  11 |                 { id: "s3", name: "Git", keywords: ["git", "github"], achievement: "GitHubを用いたソースコード管理と個人ポートフォリオの公開経験があります。" }
  12 |             ];
  13 |             window.localStorage.setItem('biddash_skills', JSON.stringify(mockSkills));
  14 |         });
  15 | 
  16 |         // アプリケーションのページを開く (サーバーのポート番号に合わせて変更してください)
  17 |         await page.goto('http://127.0.0.1:5500/HTML/index.html');
  18 |     });
  19 | 
  20 |     test('【シナリオ①の目視確認】日本語UI × 英語案件のペーストと自動マッチング', async ({ page }) => {
  21 |         // 1. 実際の募集文（Upwork想定）を準備
  22 |         const upworkJobText = "We're looking for a junior React developer to build a simple task management app. No professional experience required — a strong portfolio is enough. Budget: $300–500. Deadline: 2 weeks.";
  23 |         
  24 |         // 2. 募集文エリアにタイピング（目視しやすいように少し待つ）
  25 |         await page.fill('#job-description', upworkJobText);
  26 |         await page.waitForTimeout(1500); // 動きを目で追うためのウェイト
  27 | 
  28 |         // 3. キーワード検知による自動マッチングのバッジ表示を確認
  29 |         // 募集文に「React」が含まれるため、マッチングが走る
  30 |         const matchStatus = page.locator('#match-status');
  31 |         await expect(matchStatus).toBeVisible();
  32 |         
  33 |         // ブラウザ画面で確認できるように、3秒間そのまま一時停止
  34 |         await page.waitForTimeout(3000);
  35 |     });
  36 | 
  37 |     test('【シナリオ②の目視確認】英語UIへの切り替えと完全同期の確認', async ({ page }) => {
  38 |         // 1. データベースを開いておく（スキル名が変わる瞬間を見るため）
  39 |         await page.click('#toggle-db-btn');
  40 |         await page.waitForTimeout(1000);
  41 | 
  42 |         // 2. 言語を「🇺🇸 ENGLISH」に変更する
  43 |         await page.selectOption('#user-lang-select', 'en');
  44 |         await page.waitForTimeout(1500); // 切り替わった瞬間を目視
  45 | 
  46 |         // 3. 各UIラベルが日本語から英語に一瞬で同期したか検証
> 47 |         await expect(page.locator('#lbl-job-desc')).hasText('1. Job Description / Received Message');
     |                                                     ^ TypeError: expect(...).hasText is not a function
  48 |         await expect(page.locator('#lbl-output-title')).hasText('Generated Prime Proposal');
  49 |         
  50 |         // 4. データ死守思想の確認
  51 |         // サーバーが翻訳データを返さなくても、localStorageのスキルデータが消えずに残っているか目視
  52 |         await expect(page.locator('#skill-list-view')).toContainText('React');
  53 | 
  54 |         await page.waitForTimeout(3000);
  55 |     });
  56 | 
  57 |     test('【シナリオ③の目視確認】中国語UIへの切り替えと完全ローカライズ', async ({ page }) => {
  58 |         // 1. 言語を「🇨🇳 中文」に変更する
  59 |         await page.selectOption('#user-lang-select', 'zh');
  60 |         await page.waitForTimeout(1500);
  61 | 
  62 |         // 2. UIが中国語（先祖返りなし）になっているか検証
  63 |         await expect(page.locator('#lbl-job-desc')).hasText('1. 客户需求描述 / 收到消息');
  64 |         await expect(page.locator('#lbl-output-title')).hasText('已生成的顶级提案书');
  65 | 
  66 |         await page.waitForTimeout(3000);
  67 |     });
  68 | });
```