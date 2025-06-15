import Router from '@koa/router';
import { PrismaClient } from '@prisma/client';

const router = new Router();
const prisma = new PrismaClient();

// スレッド（木構造の根）を登録するAPI
router.post('/threads', async (ctx) => {
  const { title, content, userId } = ctx.request.body as { title?: string; content?: string; userId?: number | string };
  if (!title || !content || !userId) {
    ctx.status = 400;
    ctx.body = { error: 'title, content, userId are required' };
    return;
  }
  // userIdが存在するかチェック
  const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
  if (!user) {
    ctx.status = 400;
    ctx.body = { error: '指定されたuserIdのユーザーが存在しません' };
    return;
  }
  // スレッド（根）を作成
  const thread = await prisma.thread.create({
    data: { title, content, userId: Number(userId) },
  });
  ctx.body = thread;
});

// スレッド一覧を取得するAPI
router.get('/threads', async (ctx) => {
  // スレッド型
  type Thread = Awaited<ReturnType<typeof prisma.thread.findFirst>>;
  type Comment = Awaited<ReturnType<typeof prisma.comment.findFirst>>;

  const threads = await prisma.thread.findMany({
    include: { user: true },
    orderBy: { id: 'asc' },
  });

  // 各スレッドごとにコメントを取得し、ツリー構造に整形
  const threadsWithComments = await Promise.all(
    threads.map(async (thread: Thread) => {
      const comments = await prisma.comment.findMany({
        where: { threadId: thread.id },
        orderBy: { id: 'asc' },
      });
      // ツリー構造に変換
      function buildTree(parentId: number | null): any[] {
        return comments
          .filter((c: Comment) => c.parentId === parentId)
          .map((c: Comment) => ({
            ...c,
            children: buildTree(c.id),
          }));
      }
      return {
        ...thread,
        comments: buildTree(null),
      };
    })
  );
  ctx.body = threadsWithComments;
});

// スレッドのuuidからスレッド情報と直下のコメントツリーを取得するAPI
router.get('/threads/:uuid/tree', async (ctx) => {
  const { uuid } = ctx.params;
  const thread = await prisma.thread.findUnique({
    where: { uuid },
    include: { user: true },
  });
  if (!thread) {
    ctx.status = 404;
    ctx.body = { error: 'スレッドが見つかりません' };
    return;
  }
  // スレッド直下のコメントツリーを取得
  async function buildTree(parentId: number | null): Promise<any[]> {
    const children: any[] = await prisma.comment.findMany({
      where: { threadId: thread.id, parentId },
      orderBy: { id: 'asc' },
      include: { user: true },
    });
    return Promise.all(children.map(async (c: any) => ({
      ...c,
      children: await buildTree(c.id),
    })));
  }
  ctx.body = {
    ...thread,
    comments: await buildTree(null),
  };
});

export default router;
