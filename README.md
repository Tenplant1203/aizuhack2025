# aizuhack2025

このリポジトリは、会津ハック2025のためのWebアプリケーションです。

## アーキテクチャ概要とメリット

本プロジェクトは「フロントエンド」と「バックエンド」を明確に分離したモダンなWebアプリケーションの構成を採用しています。

- **バックエンド**はKoa（Node.js）+ PrismaでAPIサーバーを構築し、DBアクセスや認証、ビジネスロジックを担当します。
- **フロントエンド**はNext.js（React）で構築し、API経由でデータを取得・表示します。
- 認証やストレージにはSupabaseを利用し、セキュアかつスケーラブルな運用を実現しています。

### この構成のメリット

- **責務分離**: UIとAPI/DBロジックを分離することで、開発・保守が容易です。
- **スケーラビリティ**: フロント・バックエンドを独立してスケール可能です。
- **開発効率**: TypeScriptによる型安全性、PrismaによるDB操作の簡素化、Next.jsによる高速なUI開発が可能です。
- **セキュリティ**: API経由でのみDBアクセスを許可し、認証も一元管理できます。
- **柔軟なUI/UX**: React/Next.jsにより、SPA/SSR/SSGなど多様なUIパターンに対応できます。

## 使用技術・フレームワーク

- **バックエンド**
  - [Node.js](https://nodejs.org/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Koa](https://koajs.com/)（Webフレームワーク）
  - [Prisma](https://www.prisma.io/)（ORM）
  - [Supabase](https://supabase.com/)（認証・ストレージ）
- **フロントエンド**
  - [Next.js](https://nextjs.org/)（Reactベースのフレームワーク）
  - [TypeScript](https://www.typescriptlang.org/)
  - [shadcn/ui](https://ui.shadcn.com/)（UIコンポーネント）

## 構成

- `backend/` : APIサーバー
- `frontend/` : フロントエンド

## 主な機能

### バックエンド

- スレッド・コメントの作成、取得（ツリー構造対応）
- ユーザー認証
- Prisma ORMによるDB操作

### フロントエンド

- スレッド一覧・詳細表示
- コメントツリー表示
- ユーザー認証・サインアップ

## セットアップ

### 1. 環境変数の設定

- `.env` ファイルを `backend/` および `frontend/` に作成し、必要な値を設定してください。

### 2. 依存パッケージのインストール

```bash
cd backend
npm install
cd ../frontend
npm install
```

### 3. DBマイグレーション

```bash
cd backend
npx prisma migrate dev
```

### 4. サーバー起動

#### バックエンド

```bash
cd backend
npm run dev
```

#### フロントエンド

```bash
cd frontend
npm run dev
```

## 具体的な利用例

### バックエンドAPIの利用例

#### コメント作成

POST `/comments`

```json
{
  "content": "コメント本文",
  "userId": 1,
  "parentType": "thread", // または "comment"
  "parentUuid": "..."
}
```

#### コメントツリー取得

GET `/comments/tree/:parentType/:parentUuid`

### フロントエンドの開発例

#### 新しいスレッド一覧ページの作成例（`frontend/src/app/threads/page.tsx`）

```tsx
import ThreadList from "@/features/threads/ThreadList";

export default function ThreadsPage() {
  return (
    <main>
      <h1>スレッド一覧</h1>
      <ThreadList />
    </main>
  );
}
```

#### コメント投稿フォームの利用例（`frontend/src/components/ui/textarea.tsx` など）

```tsx
import Textarea from "@/components/ui/textarea";

<Textarea placeholder="コメントを入力..." />
```

## ライセンス

MIT License
