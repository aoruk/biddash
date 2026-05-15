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
            // 1. フロントから送られてきたデータ（job, skills, lang）を受け取る
            const { job, skills, lang } = JSON.parse(body);

            // 2. 言語設定に合わせて、AIへの「振る舞い」の指示を変える（ここがVer 2.0の肝！）
            let langInstruction = "";
            if(lang === 'en') {
                langInstruction = "Write the proposal in English. Use direct and professional business English suitable for Western markets (US/Europe). Focus on value proposition and clarity. Do not use over-polite Japanese-style expressions.";
            } else if(lang === 'zh') {
                langInstruction = "请用中文（简体）撰写。风格要专业、高效、重点突出。";
            } else {
                langInstruction = "日本語で、丁寧かつプロフェッショナルなビジネス敬語を使って作成してください。";
            }

            // 3. 最終的な命令文（プロンプト）を組み立てる
            const promptMessage = `
あなたは世界を股にかける、獲得率100%の伝説のフリーランスWebエンジニアです。
以下の【案件内容】に対し、私の【スキル・武器】を最大限にアピールした、選ばれるための最強の提案文を作成してください。

【出力言語とスタイルの指定】
${langInstruction}

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