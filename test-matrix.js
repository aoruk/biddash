// test-matrix.js
import fetch from 'node-fetch'; // ※もしエラーが出る場合は、下の「補足」を見てください

const BASE_URL = 'http://localhost:3000';

// テスト用のサンプルデータ
const samples = {
    ja: {
        job: "ReactとTailwind CSSを使ったECサイトのフロントエンド開発をお願いします。",
        strategy: "フルコミット可能です！コードの綺麗さには自信があります。"
    },
    en: {
        job: "We need a frontend engineer skilled in React and Tailwind CSS for an e-commerce site.",
        strategy: "I can dedicate full-time to this project and deliver high-quality code."
    },
    zh: {
        job: "我们需要一位熟练使用 React 和 Tailwind CSS 的前端工程师来协助完成电商网站。",
        strategy: "我可以全职投入这个项目，保证代码质量干净整洁。"
    }
};

const userLanguages = ['ja', 'en', 'zh'];
const jobLanguages = ['ja', 'en', 'zh'];

async function runAllTests() {
    console.log("==================================================");
    console.log("🚀 BidDash 多言語マトリクス 自動検証テスト 開始");
    console.log("==================================================\n");

    let testCount = 1;

    for (const uLang of userLanguages) {
        for (const jLang of jobLanguages) {
            console.log(`[テスト #${testCount}] 👤 UI設定: ${uLang.toUpperCase()}  ❌ 💼 案件言語: ${jLang.toUpperCase()}`);
            
            const payload = {
                userLanguage: uLang,
                jobDescription: samples[jLang].job,
                strategy: samples[uLang].strategy,
                skills: [{ name: "React", achievement: "SPA development" }]
            };

            try {
                const response = await fetch(`${BASE_URL}/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                
                // 出力結果のサマリー（先頭と末尾だけを抽出してチェック）
                const lines = data.proposal.split('\n').filter(l => l.trim() !== '');
                console.log(`  🟢 送信成功！`);
                console.log(`  🔹 生成文の冒頭: "${lines[0]?.substring(0, 40)}..."`);
                
                // 異言語クロスの場合は「---」が含まれているかチェック
                const hasDivider = data.proposal.includes('---');
                if (uLang === jLang) {
                    console.log(`  🔸 判定結果: 同一言語のため、対訳・区切り線なし（期待通り: ${!hasDivider}）`);
                } else {
                    console.log(`  🔸 判定結果: 異言語クロスのため、対訳・区切り線あり（期待通り: ${hasDivider}）`);
                }

            } catch (error) {
                console.log(`  🔴 送信失敗: ${error.message}`);
            }
            
            console.log("--------------------------------------------------");
            testCount++;
        }
    }
    
    // 【オマケ】クイック解釈の同一言語スキップテスト
    console.log("\n🧪 [追加テスト] クイック解釈（翻訳不要スキップ）の検証");
    try {
        const res = await fetch(`${BASE_URL}/translate-text`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userLanguage: 'ja', text: "日本語の文章です。" })
        });
        const data = await res.json();
        console.log(`  🔹 期待値: (翻訳不要...) ➔ 実際の応答: "${data.translatedText}"`);
    } catch (e) {
        console.log(`  🔴 クイック翻訳テスト失敗: ${e.message}`);
    }
    console.log("==================================================");
}

runAllTests();