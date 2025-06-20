import { Node, Edge } from "reactflow";
import type { CommentNode, ThreadDetail } from "@/types/chat";

/* ---------- 汎用：コメント配列を nodes / edges へ ---------- */
export function mapThreadToFlow(thread: ThreadDetail) {
  const acc: { nodes: Node[]; edges: Edge[] } = { nodes: [], edges: [] };

  /* 1. ルート (= スレッド) */
  acc.nodes.push({
    id: thread.uuid,
    type: "default",
    data: { label: `🗣 ${thread.title}` },
    position: { x: 0, y: 0 },
  });

  /* 2. 再帰でコメントを展開（children / depth どちらでも対応） */
  const walk = (
    list: CommentNode[],
    parentId: string,
    depth = 1,
    idxOffset = 0,
  ) => {
    list.forEach((c, i) => {
      const id = c.uuid;
      // --- ノード ---
      acc.nodes.push({
        id,
        type: "default",
        data: { label: `${c.user?.name}: ${c.content}` },
        // 簡易レイアウト：深度×角度で放射状
        position: {
          x: depth * 280 * Math.cos((i + idxOffset) * 0.8),
          y: depth * 280 * Math.sin((i + idxOffset) * 0.8),
        },
      });
      // --- エッジ ---
      acc.edges.push({
        id: `e-${parentId}-${id}`,
        source: parentId,
        target: id,
        type: "smoothstep",
      });
      // --- 子ノード ---
      const kids = c.children ?? [];
      if (kids.length) walk(kids, id, depth + 1, i);
    });
  };

  walk(thread.comments, thread.uuid);
  return acc;
}
