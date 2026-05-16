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
            const { job, skills, extraStrategy, lang } = parsedBody;
            
            // マッチしたスキル構造体をプロンプト用に美しいアセット形式にパース
            let formattedSkills = "特になし（基本性能で対応）";
            if (skills && skills.length > 0) {
                formattedSkills = skills.map(s => `- 【${s.name}】: ${s.achievement}`).join('\n');
            }

            const prompt = `
# あなたのアイデンティティ
あなたは世界を股にかける、獲得率100%の伝説のフリーランスWebエンジニアです。クライアントの募集要項の文脈を完璧に読み解き、競合を圧倒するスマートで刺さる提案文を作成してください。

# 与えられたアセット・武器
ユーザーのスキルデータベースから、今回の案件に自動マッチングした強力な実績は以下の通りです：
${formattedSkills}

ユーザーから追加で指定された戦略・条件：
${extraStrategy || "特になし"}

# 指示
1. **提案文(proposal)**: 【案件内容】で使用されている言語（英語なら英語、中国語なら中国語）で作成してください。
   ※注意：アセット情報や追加条件に「M4 Mac」や特定の開発環境、あるいは短納期でのアピールが含まれている場合、それをただ自慢するのではなく、「だからこそクライアントにどう貢献できるか（爆速納品、高パフォーマンステスト等）」という利益（ベネフィット）の文脈に綺麗に昇華させて組み込んでください。
2. **翻訳(translation)**: 作成した【提案文】の全内容を、指定された言語（${lang}）に一言一句漏らさず正確に翻訳してください。
   ※もし【提案文】と【指定言語】が全く同じ言語になる場合は、このフィールドは空文字列 "" にしてください。

# 出力形式
必ず以下の純粋なJSON形式のみで回答してください。解説文などは一切含めないでください。
{
  "proposal": "生成した提案書（案件の言語）",
  "translation": "提案書の全内容の指定言語への翻訳（不要なら空文字）"
}

【案件内容】:
${job}`;

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
            } catch (e) { 
                console.error("AI Response Error");
                callback(isJson ? { proposal: "Error occurred", translation: "" } : "Error occurred");
            }
        });
    });
    aiReq.write(aiReqData);
    aiReq.end();
}

const PORT = 3000;
server.listen(PORT, () => console.log(`BidDash v2.3 Server running at http://localhost:${PORT}`));