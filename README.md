# BidDash 🚀

**[ 日本語 | [English](#english) ]**

> 言語の壁を越えて、世界の案件を獲れ。
> *Break the language barrier. Win global projects.*

---

<!-- ここにデモGIFを追加予定 -->
<!-- ![BidDash Demo](./assets/demo.gif) -->

---

## BidDashとは

海外クラウドソーシング（Upwork・Freelancer等）の案件に応募する時、
**「英語の提案書が書けない」「自分のスキルをうまく伝えられない」**
という壁にぶつかったことはありませんか？

BidDashは、そのすべてを解決するAI駆動の多言語提案書生成エンジンです。

**案件文を貼るだけで、あなたの最強の提案書が完成します。**

---

## 主な機能 / Features

### 🌐 リアルタイム自動翻訳
海外の募集文をペーストすると、1秒以内に自国語へ自動翻訳。
内容を完全に理解した上で応募できます。

### 🎯 スキルDBとキーワードマッチング
一度登録したスキルを案件文と自動照合。
最も効果的なスキルを選んで提案書に反映します。

### ✍️ AI提案書の自動生成
マッチしたスキルと案件内容を統合し、
クライアントの言語で最適な提案書を即生成。
同時に自国語の全文対訳も表示するので、送信前に100%内容を確認できます。

### 🔒 データ死守設計
登録したスキルデータはブラウザのlocalStorageに即時保存。
通信エラーが発生してもデータは絶対に消えません。

---

## 対応言語 / Supported Languages

| UI言語 | 提案書出力 |
|--------|-----------|
| 🇯🇵 日本語 | ✅ |
| 🇺🇸 English | ✅ |
| 🇨🇳 中文 | ✅ |

---

## 使い方 / How to Use

```
1. 海外の案件募集文をペースト
        ↓
2. 自国語に自動翻訳されて内容を確認
        ↓
3. スキルDBが案件と自動マッチング
        ↓
4. ボタン一つで提案書を生成
        ↓
5. 全文対訳で内容を確認してコピー → 送信
```

---

## セットアップ / Setup

### 必要環境
- Node.js v18以上
- OpenAI APIキー

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/aoruk/biddash.git
cd biddash

# 依存パッケージをインストール
npm install

# 環境変数を設定
cp .env.example .env
# .envを開いてAPIキーを入力

# サーバーを起動
node server.js
```

### .envの設定

```
OPENAI_API_KEY=your_api_key_here
```

ブラウザで `http://localhost:3000` を開いてください。

---

## 技術スタック / Tech Stack

| レイヤー | 技術 |
|---------|------|
| Frontend | HTML5 / Tailwind CSS |
| Backend | Node.js |
| AI Engine | OpenAI API (GPT-4o-mini) |
| 状態管理 | localStorage |

---

## 開発背景 / Background

独学でエンジニアリングを学んできた中で、
「スキルはあるのに、英語の壁で海外案件に挑戦できない」
という現実に直面しました。

**言語は、実力の証明を邪魔すべきではない。**

そのコンセプトのもと、AI（GeminiおよびClaude）とともに
BidDashを開発しました。

未経験エンジニアが世界で戦える環境を作ることが、
このプロジェクトのミッションです。

---

## ロードマップ / Roadmap

- [x] 多言語リアルタイム翻訳
- [x] スキルDBとキーワードマッチング
- [x] AI提案書生成（3言語対応）
- [x] 完全ローカライズ（言語切り替え完全同期）
- [ ] インドネシア語・ベトナム語対応
- [ ] スキルDB クラウド同期
- [ ] 案件獲得後のビジネスコミュニケーション自動翻訳

---

## ライセンス / License

MIT License

---

<a name="english"></a>

# BidDash 🚀

**[ [日本語](#biddash-) | English ]**

> Break the language barrier. Win global projects.

---

<!-- Add demo GIF here -->
<!-- ![BidDash Demo](./assets/demo.gif) -->

---

## What is BidDash?

When applying to overseas freelance platforms like Upwork or Freelancer,
many developers face the same wall:
**"I can't write a proposal in English"** or
**"I don't know how to present my skills effectively."**

BidDash is an AI-powered multilingual proposal generation engine
that solves all of this.

**Just paste the job description — your best proposal is ready in seconds.**

---

## Key Features

### 🌐 Real-time Auto Translation
Paste any foreign job posting and get an instant translation
in your native language within 1 second.

### 🎯 Skill DB & Keyword Matching
Register your skills once. BidDash automatically matches them
against the job description and highlights the most relevant ones.

### ✍️ AI Proposal Generation
Combines your matched skills and the job content to generate
a professional proposal in the client's language —
with a full native-language translation shown side by side.

### 🔒 Data Protection by Design
Your skill data is saved instantly to localStorage.
Even if a network error occurs, your data is never lost.

---

## Supported Languages

| UI Language | Proposal Output |
|-------------|----------------|
| 🇯🇵 Japanese | ✅ |
| 🇺🇸 English | ✅ |
| 🇨🇳 Chinese | ✅ |

---

## Quick Start

### Requirements
- Node.js v18+
- OpenAI API Key

### Installation

```bash
git clone https://github.com/aoruk/biddash.git
cd biddash
npm install
cp .env.example .env
# Add your API key to .env
node server.js
```

Open `http://localhost:3000` in your browser.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5 / Tailwind CSS |
| Backend | Node.js |
| AI Engine | OpenAI API (GPT-4o-mini) |
| State | localStorage |

---

## Background

As a self-taught engineer, I hit the same wall that many developers face:
skills exist, but the language barrier blocks access to high-value global projects.

**Language should never get in the way of proving your ability.**

Built with AI partners (Gemini & Claude), BidDash is designed
to give self-taught and junior engineers a real shot at the global market.

---

## Roadmap

- [x] Multilingual real-time translation
- [x] Skill DB with keyword matching
- [x] AI proposal generation (3 languages)
- [x] Full UI localization with language sync
- [ ] Indonesian & Vietnamese support
- [ ] Cloud sync for Skill DB
- [ ] Post-project business communication translation

---

## License

MIT License

---

<div align="center">

**Built by [@aoruk](https://github.com/aoruk) with Gemini & Claude**

*For every self-taught engineer who deserves a shot at the global market.*

</div>
