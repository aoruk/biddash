import { test, expect } from '@playwright/test';

test.describe('BidDash 実際の挙動を目視確認するデモテスト', () => {

    test.beforeEach(async ({ page }) => {
        // テスト開始前に、Aoruさんのプロフィール（初期スキル）をlocalStorageに注入
        await page.addInitScript(() => {
            const mockSkills = [
                { id: "s1", name: "React", keywords: ["react"], achievement: "コンポーネント設計・Hooksを用いた開発が可能です。" },
                { id: "s2", name: "Tailwind CSS", keywords: ["tailwind", "css", "responsive"], achievement: "モバイルファーストのレスポンシブUIを高速で構築できます。" },
                { id: "s3", name: "Git", keywords: ["git", "github"], achievement: "GitHubを用いたソースコード管理と個人ポートフォリオの公開経験があります。" }
            ];
            window.localStorage.setItem('biddash_skills', JSON.stringify(mockSkills));
        });

        // アプリケーションのページを開く (サーバーのポート番号に合わせて変更してください)
        await page.goto('http://127.0.0.1:5500/HTML/index.html');
    });

    test('【シナリオ①の目視確認】日本語UI × 英語案件のペーストと自動マッチング', async ({ page }) => {
        // 1. 実際の募集文（Upwork想定）を準備
        const upworkJobText = "We're looking for a junior React developer to build a simple task management app. No professional experience required — a strong portfolio is enough. Budget: $300–500. Deadline: 2 weeks.";
        
        // 2. 募集文エリアにタイピング（目視しやすいように少し待つ）
        await page.fill('#job-description', upworkJobText);
        await page.waitForTimeout(1500); // 動きを目で追うためのウェイト

        // 3. キーワード検知による自動マッチングのバッジ表示を確認
        // 募集文に「React」が含まれるため、マッチングが走る
        const matchStatus = page.locator('#match-status');
        await expect(matchStatus).toBeVisible();
        
        // ブラウザ画面で確認できるように、3秒間そのまま一時停止
        await page.waitForTimeout(3000);
    });

    test('【シナリオ②の目視確認】英語UIへの切り替えと完全同期の確認', async ({ page }) => {
        // 1. データベースを開いておく（スキル名が変わる瞬間を見るため）
        await page.click('#toggle-db-btn');
        await page.waitForTimeout(1000);

        // 2. 言語を「🇺🇸 ENGLISH」に変更する
        await page.selectOption('#user-lang-select', 'en');
        await page.waitForTimeout(1500); // 切り替わった瞬間を目視

        // 3. 各UIラベルが日本語から英語に一瞬で同期したか検証
        await expect(page.locator('#lbl-job-desc')).hasText('1. Job Description / Received Message');
        await expect(page.locator('#lbl-output-title')).hasText('Generated Prime Proposal');
        
        // 4. データ死守思想の確認
        // サーバーが翻訳データを返さなくても、localStorageのスキルデータが消えずに残っているか目視
        await expect(page.locator('#skill-list-view')).toContainText('React');

        await page.waitForTimeout(3000);
    });

    test('【シナリオ③の目視確認】中国語UIへの切り替えと完全ローカライズ', async ({ page }) => {
        // 1. 言語を「🇨🇳 中文」に変更する
        await page.selectOption('#user-lang-select', 'zh');
        await page.waitForTimeout(1500);

        // 2. UIが中国語（先祖返りなし）になっているか検証
        await expect(page.locator('#lbl-job-desc')).hasText('1. 客户需求描述 / 收到消息');
        await expect(page.locator('#lbl-output-title')).hasText('已生成的顶级提案书');

        await page.waitForTimeout(3000);
    });
});