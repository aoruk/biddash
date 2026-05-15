require('dotenv').config();
const http = require('http');
const https = require('https');

// 【最重要】ここにあなたのOpenAI APIキーを貼り付けてください
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; 

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/generate') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const { job, skills } = JSON.parse(body);

            const promptMessage = `
あなたは獲得率100%を誇る伝説のフリーランスWebエンジニアです。
以下の【案件募集文】に対して、私の【所有スキル・武器】を最大限に活かした最強の提案文を作成してください。

【案件募集文】
${job}

【所有スキル・武器】
${skills}
`;

            const aiReqData = JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: promptMessage }],
                temperature: 0.7
            });

            const aiReq = https.request({
                hostname: 'api.openai.com',
                path: '/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                }
            }, (aiRes) => {
                let aiBody = '';
                aiRes.on('data', d => { aiBody += d; });
                aiRes.on('end', () => {
                    // ここで一旦、OpenAIから返ってきた生データをターミナル（黒い画面）に表示してチェックする
                    console.log("=== OpenAIからの返答 ===");
                    console.log(aiBody);
                    console.log("=======================");

                    res.writeHead(aiRes.statusCode, { 'Content-Type': 'application/json' });
                    res.end(aiBody);
                });
            });

            aiReq.on('error', (e) => {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: e.message }));
            });

            aiReq.write(aiReqData);
            aiReq.end();
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(3000, () => {
    console.log('🚀 BidDash サーバー起動完了！ http://localhost:3000 で待機中...');
});