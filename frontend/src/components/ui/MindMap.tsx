"use client";

import { useState, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from "reactflow";
import "reactflow/dist/style.css";

import { mapThreadToFlow } from "@/lib/flowMapper";
import type { ThreadDetail } from "@/types/chat";

export default function MindMap({
  thread,
  apiBase, // ← page.tsx 側から渡す
  onPostSuccess, // ← 新規コメントを親にも伝える
}: {
  thread: ThreadDetail;
  apiBase: string;
  onPostSuccess?: (c: any) => void;
}) {
  const { nodes: initNodes, edges: initEdges } = mapThreadToFlow(thread);
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);

  /* --------------- 返信モーダル state --------------- */
  const [replyTo, setReplyTo] = useState<Node | null>(null);
  const [text, setText] = useState("");

  const onNodeClick = useCallback((_: any, node: Node) => setReplyTo(node), []);

  /* --------------- POST → 楽観追加 --------------- */
  const submit = async () => {
    if (!text.trim() || !replyTo) return;

    /* --- ① ルート判定 --- */
    const isRoot = replyTo.id === thread.uuid; // thread.uuid は props で渡っている想定

    /* --- ② ペイロード生成 --- */
    const payload = {
      content: text.trim(),
      userId: 1, // TODO: Supabase Auth
      parentType: isRoot ? "thread" : "comment",
      parentUuid: replyTo.id,
    };

    /* --- ③ API POST --- */
    const res = await fetch(`${apiBase}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      alert(await res.text()); // 400 をそのまま表示
      return;
    }
    const newComment = await res.json(); // userId が含まれて返る

    // 投稿者の情報を取る
    const author = await (
      await fetch(`${apiBase}/users/${newComment.userId}`)
    ).json();

    /* --- ④ 楽観ノード／エッジ追加 --- */
    const angle = Math.random() * Math.PI * 2;
    const newNode: Node = {
      id: newComment.uuid,
      type: "default",
      data: { label: `${author.name}: ${newComment.content}` },
      position: {
        x: replyTo.position.x + 220 * Math.cos(angle),
        y: replyTo.position.y + 220 * Math.sin(angle),
      },
    };
    const newEdge: Edge = {
      id: `e-${replyTo.id}-${newNode.id}`,
      source: replyTo.id,
      target: newNode.id,
      type: "smoothstep",
      style: { strokeWidth: 2 },
      markerEnd: { type: "arrowclosed" },
    };

    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [...eds, newEdge]);

    /* --- ⑤ リスト側へも即反映 --- */
    onPostSuccess?.(newComment);

    /* --- ⑥ reset --- */
    setReplyTo(null);
    setText("");
  };
  return (
    <>
      <div className="w-full h-[80vh]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          defaultEdgeOptions={{
            type: "smoothstep",
            style: { strokeWidth: 2 },
            markerEnd: { type: "arrowclosed" },
          }}
        >
          <Background />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </div>

      {/* モーダル */}
      {replyTo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 w-full max-w-md space-y-3">
            <p className="text-sm text-gray-600">
              返信先:{" "}
              <span className="font-mono">{replyTo.id.slice(0, 6)}…</span>
            </p>
            <textarea
              className="w-full border rounded p-2"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="返信内容…"
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 rounded border"
                onClick={() => setReplyTo(null)}
              >
                キャンセル
              </button>
              <button
                className="px-3 py-1 rounded bg-black text-white"
                onClick={submit}
              >
                投稿
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
