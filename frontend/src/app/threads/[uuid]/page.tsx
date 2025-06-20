"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// ── ここで SSR 無効化して MindMap を読み込む ──
const MindMap = dynamic(() => import("@/components/ui/MindMap"), {
  ssr: false,
});

const API = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

/* ---------- 型定義 ---------- */
type User = { id: number; name: string };
type CommentNode = {
  uuid: string;
  content: string;
  createdAt: string;
  depth: number;
  user?: User;
  children?: CommentNode[];
};
type ThreadDetail = {
  uuid: string;
  title: string;
  content: string;
  createdAt: string;
  user: User;
  comments: CommentNode[];
};

/* ---------- ページコンポーネント ---------- */
export default function ThreadDetailPage() {
  const { uuid } = useParams() as { uuid?: string };
  const [thread, setThread] = useState<ThreadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [newComment, setNewComment] = useState("");

  /* 初回ロード */
  useEffect(() => {
    if (!uuid) {
      setError("UUID が URL に含まれていません");
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${API}/threads/${uuid}/tree`);
        if (!res.ok) throw new Error("thread-tree fetch failed");
        setThread(await res.json());
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [uuid]);

  /* コメント投稿 */
  const postComment = async () => {
    if (!uuid || !newComment.trim()) return;
    const payload = {
      content: newComment.trim(),
      userId: 1,
      parentType: "thread",
      parentUuid: uuid,
    };
    try {
      await fetch(`${API}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const refreshed: ThreadDetail = await fetch(
        `${API}/threads/${uuid}/tree`,
      ).then((r) => r.json());
      setThread(refreshed);
      setNewComment("");
    } catch (e: any) {
      alert("コメント投稿エラー: " + e.message);
    }
  };

  /* コメント描画（再帰） */
  const renderComments = (nodes: CommentNode[], depth = 0) =>
    nodes.map((c) => (
      <div
        key={c.uuid}
        className="mb-3 border-l-2 pl-2"
        style={{ marginLeft: depth * 16, borderColor: "#e2e8f0" }}
      >
        <p className="text-sm text-gray-600">
          {c.user?.name ?? "Unknown"} · {new Date(c.createdAt).toLocaleString()}
        </p>
        <p className="whitespace-pre-wrap">{c.content}</p>
        {(c.children?.length ?? 0) > 0 &&
          renderComments(c.children!, depth + 1)}
      </div>
    ));

  /* UI */
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

      {/* コメント一覧（リスト表示） */}
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

      <section className="pt-6">
        <MindMap
          thread={thread}
          apiBase={API}
          onPostSuccess={(c) => {
            // コメントリスト側へも即反映
            setThread((prev) =>
              prev ? { ...prev, comments: [...prev.comments, c] } : prev,
            );
          }}
        />
      </section>

      <hr />

      {/* コメント投稿フォーム */}
      <section className="space-y-2">
        <h3 className="text-xl font-semibold">コメントを書く</h3>
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="コメントを入力…"
          rows={4}
        />
        <Button onClick={postComment} className="cursor-pointer">
          投稿する
        </Button>
      </section>
    </main>
  );
}
