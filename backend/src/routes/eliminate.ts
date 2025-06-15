import Router from '@koa/router';
import { PrismaClient } from '@prisma/client';

const router = new Router();
const prisma = new PrismaClient();

// --- 仮: スレッド削除API（子コメントも再帰的に削除） ---
router.delete('/threads/:uuid', async (ctx) => {
  const { uuid } = ctx.params;
  const thread = await prisma.thread.findUnique({ where: { uuid } });
  if (!thread) {
    ctx.status = 404;
    ctx.body = { error: 'スレッドが見つかりません' };
    return;
  }
  // 子コメントを再帰的に削除
  await prisma.comment.deleteMany({ where: { threadId: thread.id } });
  await prisma.thread.delete({ where: { uuid } });
  ctx.body = { message: 'スレッドとそのコメントを削除しました' };
});

// --- 仮: コメント削除API（子コメントも再帰的に削除） ---
router.delete('/comments/:uuid', async (ctx) => {
  const { uuid } = ctx.params;
  const comment = await prisma.comment.findUnique({ where: { uuid } });
  if (!comment) {
    ctx.status = 404;
    ctx.body = { error: 'コメントが見つかりません' };
    return;
  }
  // 子コメントを再帰的に削除する関数
  async function deleteCommentAndChildren(id: number) {
    const children = await prisma.comment.findMany({ where: { parentId: id } });
    for (const child of children) {
      await deleteCommentAndChildren(child.id);
    }
    await prisma.comment.delete({ where: { id } });
  }
  await deleteCommentAndChildren(comment.id);
  ctx.body = { message: 'コメントとその子コメントを削除しました' };
});

export default router;
