import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai';
import 'dotenv/config';

const app = express();
const PORT = 3000;

// CORSとJSONパースの設定
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// レスポンス全体の文字コードをUTF-8に固定するミドルウェア
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// 1. 提案書生成エンドポイント
app.post('/generate', async (req, res) => {
    try {
        const { job, skills, extraStrategy, lang } = req.body;

        // 適合したスキル資産のテキスト化
        const skillsText = skills && skills.length > 0 
            ? skills.map(s => `- ${s.name}: ${s.achievement}`).join('\n')
            : 'なし（基本情報のみで構成）';

        const systemPrompt = `
You are an elite, high-converting business proposal writer for freelancers.
Your task is to draft a flawless, persuasive, and custom-tailored proposal based on the client's job description, the user's matched internal skill assets, and extra strategic conditions.

[CRITICAL RULE 1]
Output your final response STRICTLY in valid JSON format with exactly two keys: "proposal" and "translation". Do not include any markdown block markers like \`\`\`json or \`\`\`.

[CRITICAL RULE 2]
- "proposal": Write the strategic proposal in the target language requested (if target language is 'ja', write in Japanese. If 'en', write in English. If 'zh', write in Chinese).
- "translation": Provide a full, natural Japanese translation of the generated proposal. If the requested language is already 'ja', leave the "translation" field empty ("").

[CRITICAL RULE 3]
You must encode the JSON response perfectly in UTF-8. Ensure all multi-byte Japanese characters in the "translation" field are complete and never corrupted or truncated.
`;

        const userPrompt = `
[Target Job Description]
${job}

[User's Matched Skill Assets (Incorporate these naturally as value propositions, not just bragging)]
${skillsText}

[Extra Strategic Conditions / Nuances]
${extraStrategy || 'None'}

[Requested Output Language for the Proposal]
${lang === 'ja' ? 'Japanese' : lang === 'zh' ? 'Chinese' : 'English'}
`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" }
        });

        // 厳密にUTF-8文字列としてパース
        const rawResult = completion.choices[0].message.content;
        const jsonResponse = JSON.parse(Buffer.from(rawResult, 'utf-8').toString('utf-8'));

        res.json(jsonResponse);

    } catch (error) {
        console.error('Generation Error:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// 2. 案件募集文のクイック翻訳エンドポイント
app.post('/translate-source', async (req, res) => {
    try {
        const { text, targetLang } = req.body;
        if (!text) return res.json({ translatedText: '' });

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { 
                    role: "system", 
                    content: "You are a professional business translator. Translate the given text into natural, concise Japanese. Output ONLY the translated text, nothing else. Ensure perfect UTF-8 encoding." 
                },
                { role: "user", content: text }
            ]
        });

        const translatedText = completion.choices[0].message.content.trim();
        res.json({ translatedText });
    } catch (error) {
        console.error('Translation Error:', error);
        res.status(500).json({ error: 'Translation Failed' });
    }
});

app.listen(PORT, () => {
    console.log(`BidDash v2.3.1 Server running at http://localhost:3000`);
});