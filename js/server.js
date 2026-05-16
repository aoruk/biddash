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

// 言語コードから言語名へのマッピング
const getLangName = (code) => {
    if (code === 'en') return 'ENGLISH';
    if (code === 'zh') return 'CHINESE';
    return 'JAPANESE';
};

app.post('/generate', async (req, res) => {
    try {
        const { job, skills, extraStrategy, userLang } = req.body;

        const skillsText = skills && skills.length > 0 
            ? skills.map(s => `- ${s.name}: ${s.achievement}`).join('\n')
            : 'None';

        const systemPrompt = `
You are an elite, world-class freelancer and expert proposal writer for global platforms.
Analyze the user's input language and the language used in the Client's Job Description.

[TASK]
1. Detect the language of the Client's Job Description.
2. Write a highly persuasive, comprehensive proposal strictly in the SAME language as the Client's Job Description to ensure it matches the client's expectation.
3. Structure: Hook (customized opening), Solution & Approach, Value Proposition (weave in skills), and Call to Action.
4. Translation Rule:
   - If the detected job language is DIFFERENT from the user's language (${getLangName(userLang)}), provide a natural translation of the proposal into ${getLangName(userLang)} under the "translation" key.
   - If the detected job language is the SAME as the user's language (${getLangName(userLang)}), set the "translation" key to an empty string "".

[CRITICAL OUTPUT RULES]
Output strictly in JSON format with exactly two keys: "proposal" and "translation". Do not include any markdown blocks.
`;

        const userPrompt = `
[User's Language Context]
${getLangName(userLang)}

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

app.post('/analyze-source', async (req, res) => {
    try {
        const { text, userLang } = req.body;
        if (!text) return res.json({ shouldTranslate: false, translatedText: '' });

        const systemPrompt = `
Analyze the language of the provided text.
Compare it with the user's native language: ${getLangName(userLang)}.

Output strictly in JSON format with two keys:
- "isSameLanguage": boolean (true if the text is primarily in the user's native language, false otherwise)
- "translatedText": string (If isSameLanguage is false, provide a professional translation/summary into the user's language. If true, return empty string "")
`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: text }
            ],
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: 'Analysis Failed' });
    }
});

app.listen(PORT, () => {
    console.log(`BidDash v2.4.0 Global Engine running at http://localhost:3000`);
});