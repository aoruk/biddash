import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai';
import 'dotenv/config';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.post('/generate', async (req, res) => {
    try {
        const { job, skills, extraStrategy, lang } = req.body;

        const skillsText = skills && skills.length > 0 
            ? skills.map(s => `- ${s.name}: ${s.achievement}`).join('\n')
            : 'なし';

        // ターゲット言語の判定（デフォルトは英語）
        const targetLanguageName = lang === 'zh' ? 'CHINESE' : 'ENGLISH';

        const systemPrompt = `
You are an elite, world-class freelancer and expert proposal writer for global platforms like Upwork.
Your goal is to write a highly persuasive, detailed, and comprehensive proposal that stands out and wins the client's trust immediately.

[PROPOSAL STRUCTURE RULES]
1. Hook: Start with a professional greeting and a strong, customized opening that proves you read and understood their specific needs.
2. Solution & Approach: Explain clearly HOW you will solve their problem. Provide a brief roadmap or best practices for their specific request (e.g., mobile-first design, clean Tailwind CSS code structure).
3. Value Proposition (Incorporate Skills): Naturally weave in the user's matched skills and achievements as proof of capability. Frame them as direct benefits to the client.
4. Call to Action: End with a low-friction invitation to chat or hop on a brief call.

[CRITICAL OUTPUT RULES]
Output your final response STRICTLY in valid JSON format with exactly two keys: "proposal" and "translation". Do not include any markdown code blocks.
- "proposal": Always generate the comprehensive, elite proposal strictly in ${targetLanguageName}.
- "translation": Provide a natural, professionally accurate Japanese translation of the ENTIRE proposal generated above.
Ensure perfect UTF-8 encoding so that no characters are truncated or corrupted.
`;

        const userPrompt = `
[Client's Job Description]
${job}

[User's Matched Skill Assets to Inject]
${skillsText}

[Extra Strategic Nuances from User]
${extraStrategy || 'None'}
`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" }
        });

        const rawResult = completion.choices[0].message.content;
        const jsonResponse = JSON.parse(Buffer.from(rawResult, 'utf-8').toString('utf-8'));

        res.json(jsonResponse);

    } catch (error) {
        console.error('Generation Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/translate-source', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.json({ translatedText: '' });

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Translate the given client job description into natural, concise Japanese for quick reading. Output ONLY the translation." },
                { role: "user", content: text }
            ]
        });

        res.json({ translatedText: completion.choices[0].message.content.trim() });
    } catch (e) {
        res.status(500).json({ error: 'Failed' });
    }
});

app.listen(PORT, () => {
    console.log(`BidDash v2.3.4 Server running at http://localhost:3000`);
});