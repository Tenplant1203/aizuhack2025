"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function NewThreadPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !content.trim()) {
      setError("タイトルと本文を両方入力してください");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          userId: 1, // 本番ではログイン中ユーザーの ID をセット
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}) as any);
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      const created = await res.json(); // { id, uuid, ... }
      // 作成後は詳細ページへ遷移
      router.push(`/threads/${created.uuid}`);
    } catch (e: any) {
      setError("作成に失敗しました: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">新しいスレッドを作成</h1>
      {error && <p className="mb-4 text-red-600">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">タイトル</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            placeholder="スレッドのタイトル"
          />
        </div>
        <div>
          <label className="block mb-1">本文</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.currentTarget.value)}
            placeholder="スレッドの内容を入力…"
            rows={6}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "送信中…" : "スレッドを作成"}
        </Button>
      </form>
    </main>
  );
}
