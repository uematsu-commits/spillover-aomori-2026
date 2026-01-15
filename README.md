# 英語学習アプリ - 苦手な単語を文脈で覚える

Next.js 14、TypeScript、Tailwind CSSを使用したモダンな英語学習アプリケーションです。

## 技術スタック

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI互換コンポーネント
- **Icons**: Lucide React

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリを確認できます。

## ページ構成

1. **Dashboard (/)**: 現在のレベル、学習状況の概要表示
2. **Vocabulary List (/vocabulary)**: 苦手な単語帳の一覧表示
3. **Settings (/settings)**: ユーザーの英語レベル設定とOpenAI APIキーの入力

## 機能

- 📊 学習進捗の可視化
- 📚 苦手な単語の管理
- ⚙️ ユーザー設定の管理
- 🎨 モダンで洗練されたUI

## 今後の実装予定

- 単語テスト機能
- AIストーリー生成機能
- 学習履歴の保存
- データの永続化

