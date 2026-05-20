import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { OpenAI } from 'openai';

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI();

/**
 * ====================================================================
 * 【1】 クイック解釈 API（海外募集文を即座に日本語化）
 * ====================================================================
 */
app.post('/translate-text', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'Text is required' });

        const systemPrompt = `あなたはプロのITフリーランス通訳エンジンです。
海外のクライアントから送られてきた募集文やメッセージのニュアンスを100%正確に残し、日本の開発者が一瞬で内容を解釈・把握できる極めて自然な「日本語」に翻訳してください。
「未経験歓迎」「実績不問」などのエンジニアにとって有利なチャンスがあれば、そこを強調して訳してください。解説や挨拶は省き、翻訳本文のみを出力すること。`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: text }
            ],
            temperature: 0.2
        });

        res.json({ translatedText: response.choices[0].message.content.trim() });
    } catch (error) {
        console.error('❌ /translate-text Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * ====================================================================
 * 【2】 最強提案書（カバーレター）生成 API（自国語入力 ➔ 英文＋日本語対訳）
 * ====================================================================
 */
app.post('/generate', async (req, res) => {
    try {
        const { jobDescription, strategy, skills } = req.body;

        const systemPrompt = `あなたはグローバルなフリーランスプラットフォーム（Upwork等）で圧倒的な成約率を誇る、世界最高峰のIT案件獲得エージェントです。
日本の優秀な開発者が、英語の壁を越えて海外案件を獲得するための「最強の英文カバーレター」を構築してください。

【⚠️出力言語・構成の絶対ガードレール】
1. 前半部分【提案書本文】は、クライアントへそのままコピペして提出するため、完全に流暢でプロフェッショナルな【英語（English）】のみで執筆してください。
2. 提案書の最後（末尾）に、必ず「---（水平線）」で区切った上で、日本のユーザーが内容を100%把握・納得して送信できるよう、完璧な【日本語による全文対訳（日本語訳）】をセットで出力してください。

【アイデンティティと強みへの変換規則】
・ユーザーのスキル資産や、エリア2に入力された戦略（生い立ち、異業種での経験、未経験の熱意）を読み込み、海外クライアントに刺さる強み（例：「レガシーな悪い癖がないため、最新のReact/Tailwind CSSによるクリーンで高速なモダン開発に105%特化できる」「前職での管理・折衝スキルがあるためコミュニケーションが極めてスムーズ」「GitHubでソースをフル公開しており品質に絶対の自信がある」など）へ強力に変換してアピールに組み込んでください。
・ただし、嘘の実績（架空の実務経験や、盛った案件数など）を捏造することはハルシネーションとして厳重に禁止します。

【出力フォーマット】
[プロフェッショナルな英文カバーレター本文（クライアント提出用）]

---
【内容確認用・日本語対訳】
[上記英文の綺麗な日本語訳]`;

        const userContent = `
■ ターゲットの案件募集文 (Job Description):
${jobDescription}

■ ユーザーの保有スキル資産 (Skills):
${JSON.stringify(skills)}

■ ユーザーの生い立ち・経験・熱意・戦略 (Strategy & Narrative):
${strategy || '特になし'}
`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o', // 高品質な英文・対比表現のためにメインモデルを使用
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userContent }
            ],
            temperature: 0.6
        });

        res.json({ proposal: response.choices[0].message.content.trim() });
    } catch (error) {
        console.error('❌ /generate Error:', error);
        res.status(500).json({ error: 'Proposal generation failed' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 BidDash Backend Core Engine running on http://localhost:${PORT}`);
});