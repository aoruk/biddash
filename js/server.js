require('dotenv').config();
const http = require('http');
const https = require('https');

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        if (!body) return;
        const parsedBody = JSON.parse(body);

        // 提案書生成ルート
        if (req.url === '/generate') {
            const { job, skills, lang } = parsedBody;
            const prompt = `
あなたは世界を股にかける、獲得率100%の伝説のフリーランスWebエンジニアです。
1. **提案文(proposal)**: 【案件内容】と同じ言語で作成してください。
2. **翻訳(translation)**: 提案文の全内容を、指定言語（${lang}）に一言一句漏らさず翻訳してください。※同言語なら空文字""。
出力形式: JSON { "proposal": "...", "translation": "..." }
【案件内容】: ${job}
【スキル】: ${skills}`;

            callOpenAI(prompt, true, (result) => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            });
        } 
        // 募集文の即時翻訳ルート
        else if (req.url === '/translate-source') {
            const { text, targetLang } = parsedBody;
            const prompt = `以下のテキストを、指定された言語（${targetLang}）に翻訳してください。余計な解説は不要です。\n\n${text}`;
            
            callOpenAI(prompt, false, (result) => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ translatedText: result }));
            });
        }
    });
});

function callOpenAI(prompt, isJson, callback) {
    const aiReqData = JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: isJson ? { type: "json_object" } : { type: "text" }
    });

    const options = {
        hostname: 'api.openai.com', port: 443, path: '/v1/chat/completions', method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
    };

    const aiReq = https.request(options, (aiRes) => {
        let aiBody = '';
        aiRes.on('data', (chunk) => { aiBody += chunk; });
        aiRes.on('end', () => {
            try {
                const aiResponse = JSON.parse(aiBody);
                const content = aiResponse.choices[0].message.content;
                callback(isJson ? JSON.parse(content) : content);
            } catch (e) { console.error("AI Response Error"); }
        });
    });
    aiReq.write(aiReqData);
    aiReq.end();
}

const PORT = 3000;
server.listen(PORT, () => console.log(`BidDash v2.2 Server running at http://localhost:${PORT}`));