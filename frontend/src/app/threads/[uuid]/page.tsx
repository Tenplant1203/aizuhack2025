"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

type Comment = {
  uuid: string;
  content: string;
  createdAt: string;
  user: { id: number; name: string };
  children: Comment[];
};
type ThreadDetail = {
  uuid: string;
  title: string;
  content: string;
  createdAt: string;
  user: { id: number; name: string };
  comments: Comment[];
};

export default function ThreadDetailPage() {
  const { uuid } = useParams() as { uuid?: string };
  const [thread, setThread] = useState<ThreadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (!uuid) return setError("UUID が URL に含まれていません");

    fetch(`http://localhost:4000/threads/${uuid}/tree`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`API エラー: ${res.status}`);
        return res.json();
      })
      .then((data: ThreadDetail) => setThread(data))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [uuid]);

  const postComment = async () => {
    if (!uuid || !newComment.trim()) return;
    const payload = {
      content: newComment.trim(),
      userId: 1,
      parentType: "thread",
      parentUuid: uuid,
    };

    try {
      const res = await fetch("http://localhost:4000/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      setNewComment("");
      // コメント投稿後にリロード
      setLoading(true);
      const fresh = await fetch(`http://localhost:4000/threads/${uuid}/tree`, {
        cache: "no-store",
      });
      setThread(await fresh.json());
    } catch (e: any) {
      alert("コメント投稿でエラー: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const renderComments = (comments: Comment[], depth = 0) =>
    comments.map((c) => (
      <div key={c.uuid} style={{ marginLeft: depth * 20 }} className="mb-2">
        <p className="text-sm text-gray-600">
          {c.user.name} @ {new Date(c.createdAt).toLocaleString()}
        </p>
        <p className="pl-2">{c.content}</p>
        {c.children.length > 0 && renderComments(c.children, depth + 1)}
      </div>
    ));

  if (loading) return <p>読み込み中…</p>;
  if (error) return <p className="text-red-600">エラー: {error}</p>;
  if (!thread) return <p>スレッドが見つかりません</p>;

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      {/* スレッド本体 */}
      <article>
        <h1 className="text-3xl font-bold mb-2">{thread.title}</h1>
        <p className="text-sm text-gray-500">
          投稿者: {thread.user.name} ／ 投稿日:{" "}
          {new Date(thread.createdAt).toLocaleString()}
        </p>
        <div className="mt-4 whitespace-pre-wrap">{thread.content}</div>
      </article>

      <hr />

      {/* コメント一覧 */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">
          コメント ({thread.comments.length})
        </h2>
        {thread.comments.length === 0 ? (
          <p className="text-gray-500">
            まだコメントはありません。最初のコメントをどうぞ！
          </p>
        ) : (
          renderComments(thread.comments)
        )}
      </section>

      <hr />

      {/* コメント投稿フォーム */}
      <section className="space-y-2">
        <h3 className="text-xl font-semibold">コメントを書く</h3>
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.currentTarget.value)}
          placeholder="コメントを入力…"
          rows={4}
        />
        <Button onClick={postComment}>投稿する</Button>
      </section>
    </main>
  );
}
