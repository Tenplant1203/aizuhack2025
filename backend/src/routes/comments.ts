import Router from "@koa/router";
import { PrismaClient } from "@prisma/client";

const router = new Router();
const prisma = new PrismaClient();

/*------------------------------------
  POST /comments   （uuidベース）
------------------------------------*/
router.post("/comments", async (ctx) => {
  const { content, userId, parentType, parentUuid } = ctx.request.body as {
    content?: string;
    userId?: number | string;
    parentType?: "thread" | "comment";
    parentUuid?: string;
  };

  if (!content || !userId || !parentType || !parentUuid) {
    return ctx.throw(
      400,
      "content, userId, parentType, parentUuid are required",
    );
  }

  // ------------------------
  // スレッド & 親コメント特定
  // ------------------------
  let threadId: number | null;
  let parentId: number | null = null;
  let depth = 0; // ★ depth 初期値

  if (parentType === "thread") {
    const thread = await prisma.thread.findUnique({
      where: { uuid: parentUuid },
    });
    if (!thread) return ctx.throw(404, "thread not found");
    threadId = thread.id;
  } else {
    // parentType === "comment"
    const parent = await prisma.comment.findUnique({
      where: { uuid: parentUuid },
    });
    if (!parent) return ctx.throw(404, "parent comment not found");
    threadId = parent.threadId;
    parentId = parent.id;
    depth = parent.depth + 1; // ★ 親の depth +1
  }

  // ------------------------
  // コメント作成
  // ------------------------
  const comment = await prisma.comment.create({
    data: {
      content,
      userId: Number(userId),
      threadId,
      parentId,
      parentType,
      parentUuid,
      depth, // ★ 保存
    },
  });

  ctx.status = 201;
  ctx.body = comment;
});

/*------------------------------------
  GET /comments/tree/:type/:uuid
------------------------------------*/
router.get("/comments/tree/:parentType/:parentUuid", async (ctx) => {
  const { parentType, parentUuid } = ctx.params as {
    parentType: "thread" | "comment";
    parentUuid: string;
  };

  let threadId: number | null;
  let parentId: number | null = null;

  if (parentType === "thread") {
    const thread = await prisma.thread.findUnique({
      where: { uuid: parentUuid },
      include: {
        user: { select: { id: true, name: true } },
      },
    });
    if (!thread) return ctx.throw(404, "thread not found");
    threadId = thread.id;
  } else {
    const parent = await prisma.comment.findUnique({
      where: { uuid: parentUuid },
    });
    if (!parent) return ctx.throw(404, "parent comment not found");
    threadId = parent.threadId;
    parentId = parent.id;
  }

  /* ツリー構築：depth があるので orderBy(depth, id) でも OK */
  async function buildTree(pid: number | null): Promise<any[]> {
    const nodes = await prisma.comment.findMany({
      where: { threadId, parentId: pid },
      orderBy: [{ depth: "asc" }, { id: "asc" }],
      include: { user: true },
    });
    return Promise.all(
      nodes.map(async (n) => ({
        ...n,
        children: await buildTree(n.id),
      })),
    );
  }

  ctx.body = await buildTree(parentId);
});

export default router;
