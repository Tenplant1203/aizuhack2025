import Router from '@koa/router';
import { PrismaClient } from '@prisma/client';

const router = new Router();
const prisma = new PrismaClient();

// コメント追加（親子・兄弟対応）
router.post('/threads/:id/comments', async (ctx) => {
  const threadId = Number(ctx.params.id);
  const { content, userId, parentId } = ctx.request.body as { content?: string; userId?: number | string; parentId?: number | null };
  if (!content || !userId) {
    ctx.status = 400;
    ctx.body = { error: 'content, userId are required' };
    return;
  }
  // parentIdが指定されている場合は、そのコメントが存在するかチェック
  if (parentId) {
    const parentComment = await prisma.comment.findUnique({ where: { id: Number(parentId) } });
    if (!parentComment) {
      ctx.status = 400;
      ctx.body = { error: '指定されたparentIdのコメントが存在しません' };
      return;
    }
  }
  const comment = await prisma.comment.create({
    data: {
      content,
      threadId,
      userId: Number(userId),
      parentId: parentId ? Number(parentId) : null,
    },
  });
  ctx.body = comment;
});

// コメント一覧を取得するAPI
router.get('/threads/:id/comments', async (ctx) => {
  const threadId = Number(ctx.params.id);
  const comments = await prisma.comment.findMany({
    where: { threadId },
    include: { user: true }, // 必要に応じてリレーションも取得
  });
  ctx.body = comments;
});

// コメント追加（親子・兄弟対応、uuidベース）
router.post('/comments', async (ctx) => {
  const { content, userId, parentType, parentUuid } = ctx.request.body as {
    content?: string;
    userId?: number | string;
    parentType?: 'thread' | 'comment';
    parentUuid?: string;
  };
  if (!content || !userId || !parentType || !parentUuid) {
    ctx.status = 400;
    ctx.body = { error: 'content, userId, parentType, parentUuid are required' };
    return;
  }
  let threadId: number | null = null;
  let parentId: number | null = null;
  if (parentType === 'thread') {
    const thread = await prisma.thread.findUnique({ where: { uuid: parentUuid } });
    if (!thread) {
      ctx.status = 400;
      ctx.body = { error: '指定された親スレッドが存在しません' };
      return;
    }
    threadId = thread.id;
  } else if (parentType === 'comment') {
    const parentComment = await prisma.comment.findUnique({ where: { uuid: parentUuid } });
    if (!parentComment) {
      ctx.status = 400;
      ctx.body = { error: '指定された親コメントが存在しません' };
      return;
    }
    threadId = parentComment.threadId;
    parentId = parentComment.id;
  } else {
    ctx.status = 400;
    ctx.body = { error: 'parentTypeは"thread"または"comment"である必要があります' };
    return;
  }
  const comment = await prisma.comment.create({
    data: {
      content,
      threadId,
      userId: Number(userId),
      parentId,
      parentType,
      parentUuid,
    },
  });
  ctx.body = comment;
});

// uuidベースでコメントツリーを取得
router.get('/comments/tree/:parentType/:parentUuid', async (ctx) => {
  const { parentType, parentUuid } = ctx.params;
  let threadId: number | null = null;
  let parentId: number | null = null;
  if (parentType === 'thread') {
    const thread = await prisma.thread.findUnique({ where: { uuid: parentUuid } });
    if (!thread) {
      ctx.status = 404;
      ctx.body = { error: 'スレッドが見つかりません' };
      return;
    }
    threadId = thread.id;
  } else if (parentType === 'comment') {
    const parentComment = await prisma.comment.findUnique({ where: { uuid: parentUuid } });
    if (!parentComment) {
      ctx.status = 404;
      ctx.body = { error: '親コメントが見つかりません' };
      return;
    }
    threadId = parentComment.threadId;
    parentId = parentComment.id;
  } else {
    ctx.status = 400;
    ctx.body = { error: 'parentTypeは"thread"または"comment"である必要があります' };
    return;
  }
  // 指定親直下のコメントを取得し、ツリー構造に整形
  const comments = await prisma.comment.findMany({
    where: {
      threadId,
      parentId: parentId,
    },
    orderBy: { id: 'asc' },
    include: { user: true },
  });
  async function buildTree(parentId: number | null): Promise<any[]> {
    const children: any[] = await prisma.comment.findMany({
      where: { threadId, parentId },
      orderBy: { id: 'asc' },
      include: { user: true },
    });
    return Promise.all(children.map(async (c: any) => ({
      ...c,
      children: await buildTree(c.id),
    })));
  }
  ctx.body = await buildTree(parentId);
});

export default router;
