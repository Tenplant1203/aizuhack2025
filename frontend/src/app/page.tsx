"use client";

import Link from "next/link";
import { Button } from "@ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/card";
import { useSession } from "@supabase/auth-helpers-react";

export default function Home() {
  const session = useSession();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-8 px-6 text-center">
      <h1 className="text-4xl font-bold">Threadly</h1>
      <p className="text-lg text-gray-600 max-w-xl">
        シンプル＆高速なスレッド型コミュニケーションプラットフォーム。
        スレッド作成、コメント、メンション、アーカイブ機能を備えています。
      </p>
      {session ? (
        <Button>
          <Link href="/threads">スレッド一覧へ</Link>
        </Button>
      ) : (
        <div className="space-x-4">
          <Button size="lg">
            <Link href="/auth/login">ログイン </Link>
          </Button>
          <Button variant="outline" size="lg">
            <Link href="/auth/signup">新規登録</Link>
          </Button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <Card>
          <CardHeader>
            <CardTitle>🚀 スピード重視</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              レイテンシーの少ないリアルタイム体験でストレスなく会話が可能。
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>🔒 セキュア</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              SuperbaseAuth.js
              による堅牢な認証／認可基盤で安心して利用できます。
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>📱 どこでも共有</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Web Share API やリンクコピーでスレッドを簡単にシェア。
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
