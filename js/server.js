import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { OpenAI } from 'openai';

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI();

// フロントのコード（ja, en, zh）と完全に一致させるマッピング
const langMap = { 
    'ja': 'Japanese', 
    'en': 'English', 
    'zh': 'Chinese' 
};

/**
 * ====================================================================
 * 【1】 クイック解釈 API（中国語UI時も完璧に対応）
 * ====================================================================
 */
app.post('/translate-text', async (req, res) => {
    try {
        const { text, userLanguage } = req.body;
        if (!text) return res.status(400).json({ error: 'Text is required' });

        const userLangName = langMap[userLanguage] || 'Japanese';

        const systemPrompt = `输入一段文本，请将其极其自然地翻译为用户母语：【${userLangName}】。
（※If userLanguage is Japanese, translate to Japanese. If English, translate to English. If Chinese, translate to Chinese.）
如果输入的文本已经是【${userLangName}】，或者完全不需要翻译，请不要输出任何解释或多余的话，直接仅输出 "（翻訳不要 / Same Language）" 这一个词。
如果需要翻译，请仅输出翻译后的正文内容。`;

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
 * 【2】 三カ国語完全対応マトリクス：最強提案書生成 API
 * ====================================================================
 */
app.post('/generate', async (req, res) => {
    try {
        const { jobDescription, strategy, skills, userLanguage } = req.body;
        const userLangName = langMap[userLanguage] || 'Japanese';

        // 1. AIに案件募集文が「Japanese」「English」「Chinese」のどれかを厳密に3択で判定させる
        const detectResponse = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: "Analyze the language of the given text and return exactly one word from: 'Japanese', 'English', or 'Chinese'. Do not include any punctuation or extra words." },
                { role: 'user', content: jobDescription }
            ],
            temperature: 0.0
        });
        
        let jobLangName = detectResponse.choices[0].message.content.trim();
        // 万が一の表記ブレ吸収（念のため）
        if (jobLangName.includes('Japan')) jobLangName = 'Japanese';
        if (jobLangName.includes('Eng')) jobLangName = 'English';
        if (jobLangName.includes('Chin')) jobLangName = 'Chinese';

        // 2. 自国語と案件言語が一致しているかのフラグ判定
        const isSameLanguage = (userLangName === jobLangName);

        let matrixRulePrompt = "";
        if (isSameLanguage) {
            matrixRulePrompt = `【⚠️現在の確定マトリクスルール：同一言語パターン】
- ユーザーの自国語と案件の言語は、共に【${userLangName}】で完全に一致しています。
- したがって、提案書（カバーレター）本文は【${userLangName}】のみで執筆してください。
- 同一言語同士のコミュニケーションであるため、確認用の「---」や翻訳文（対訳）は【絶対に含めないでください】。ピュアな提案書本文のみをシンプルに出力すること。`;
        } else {
            matrixRulePrompt = `【⚠️現在の確定マトリクスルール：異言語クロスパターン】
- ユーザーの自国語は【${userLangName}】、案件のターゲット言語は【${jobLangName}】で異なっています。
- したがって、前半部分の提案書本文は、クライアントがそのまますぐに読めるよう、完全に【${jobLangName}】のみで執筆してください。
- 執筆後、必ず末尾に「---（半角ハイフン3つ）」の区切り線を入れ、その後ろにユーザーが内容を100%自己確認するための【${userLangName}訳（対訳）】をセットで出力してください。`;
        }

        const systemPrompt = `あなたはグローバルな案件獲得プラットフォームで無敗を誇る、世界最高峰のIT提案書（カバーレター）作成エージェントです。
指定された言語出力を「絶対のガードレール」として厳格に遵守してください。

${matrixRulePrompt}

【アイデンティティと強みへの変換規則】
・ユーザーの保有スキル情報（Skills）や、日本語または他言語で書かれた泥臭い戦略・熱意・生い立ち（Strategy）の内容の「本質」を120%深く読み込み、プロとしての強みへと高度に昇華させて、提案の骨子に組み込んでください。
・実務実績を嘘偽りで捏造することは厳重に禁止します。`;

        const userContent = `
■ 確定マトリクスパラメータ:
- ユーザーの自国語 (User Language): ${userLangName}
- 分析された案件の言語 (Job Language): ${jobLangName}

■ ターゲットの案件募集文 (Job Description):
${jobDescription}

■ ユーザーの保有スキル資産 (Skills):
${JSON.stringify(skills)}

■ ユーザーの生い立ち・経験・熱意・戦略 (Strategy & Narrative):
${strategy || '特になし'}
`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o', // 高度な三カ国クロス翻訳マッピングのためメインモデルを固定
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userContent }
            ],
            temperature: 0.5
        });

        res.json({ proposal: response.choices[0].message.content.trim() });
    } catch (error) {
        console.error('❌ /generate Error:', error);
        res.status(500).json({ error: 'Proposal generation failed' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 BidDash Perfect Multi-Matrix Core Engine running on http://localhost:${PORT}`);
});