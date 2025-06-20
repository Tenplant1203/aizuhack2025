"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BASE_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export default function NewThreadPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");

    try {
      const payload = { title, content, userId: 1 }; // 例として userId=1
      console.log("▶︎ Sending payload:", payload);

      const res = await fetch(`${BASE_URL}/threads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("❌ API 400 response:", body);
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      router.push("/threads");
    } catch (err: any) {
      setErr(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold">新しいスレッドを作成</h1>

      <label className="block">
        <span>タイトル</span>
        <input
          className="mt-1 w-full border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>

      <label className="block">
        <span>本文</span>
        <textarea
          className="mt-1 w-full border p-2 rounded h-40"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </label>

      {err && <p className="text-red-600">エラー：{err}</p>}

      <Button type="submit">スレッドを作成</Button>
    </form>
  );
}
