import Koa from 'koa';
import Router from '@koa/router';
import { PrismaClient } from '@prisma/client';
import bodyParser from 'koa-bodyparser';
import commentsRouter from './routes/comments';
import rootRouter from './routes/root';
import { v4 as uuidv4 } from 'uuid';

const app = new Koa();
const router = new Router();
const prisma = new PrismaClient();

interface Context extends Koa.Context {
  user?: any; // Define the user type as needed
}

app.use(bodyParser());
app.use(commentsRouter.routes());
app.use(rootRouter.routes());

router.get('/user', async (ctx: Context) => {
  ctx.body = await prisma.user.findMany();
});

// スレッド一覧取得
router.get('/threads', async (ctx: Context) => {
  const threads = await prisma.thread.findMany({
    include: {
      user: true,
      comments: {
        include: { user: true },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  // コメントをツリー構造に変換
  function buildCommentTree(comments: any[]): any[] {
    const map: { [key: number]: any } = {};
    comments.forEach(function(c: any) { map[c.id] = { ...c, children: [] }; });
    const roots: any[] = [];
    comments.forEach(function(c: any) {
      if (c.parentId) {
        if (map[c.parentId]) map[c.parentId].children.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });
    return roots;
  }
  ctx.body = threads.map(function(thread: any) {
    return {
      ...thread,
      comments: buildCommentTree(thread.comments)
    };
  });
});

// スレッド作成（uuid発行対応）
router.post('/threads', async (ctx: Context) => {
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
  const thread = await prisma.thread.create({
    data: { title, content, userId: Number(userId), uuid: uuidv4() },
  });
  ctx.body = thread;
});

// ユーザー登録
router.post('/user', async (ctx: Context) => {
  const { name, email } = ctx.request.body as { name?: string; email?: string };
  if (!name || !email) {
    ctx.status = 400;
    ctx.body = { error: 'name, email are required' };
    return;
  }
  // メールアドレス重複チェック
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    ctx.status = 400;
    ctx.body = { error: 'このメールアドレスは既に登録されています' };
    return;
  }
  const user = await prisma.user.create({ data: { name, email } });
  ctx.body = user;
});

// コメント作成（uuid発行・親情報対応）
router.post('/comments', async (ctx: Context) => {
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
  // userIdが存在するかチェック
  const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
  if (!user) {
    ctx.status = 400;
    ctx.body = { error: '指定されたuserIdのユーザーが存在しません' };
    return;
  }
  let threadId: number | null = null;
  let parentId: number | null = null;
  if (parentType === 'thread') {
    const thread = await prisma.thread.findUnique({ where: { uuid: parentUuid } });
    if (!thread) {
      ctx.status = 400;
      ctx.body = { error: '親スレッドが存在しません' };
      return;
    }
    threadId = thread.id;
  } else if (parentType === 'comment') {
    const parentComment = await prisma.comment.findUnique({ where: { uuid: parentUuid } });
    if (!parentComment) {
      ctx.status = 400;
      ctx.body = { error: '親コメントが存在しません' };
      return;
    }
    threadId = parentComment.threadId;
    parentId = parentComment.id;
  }
  const comment = await prisma.comment.create({
    data: {
      content,
      userId: Number(userId),
      threadId: threadId!,
      parentId,
      uuid: uuidv4(),
      parentType,
      parentUuid,
    },
  });
  ctx.body = comment;
});

// データベースリセット（全データ削除）
router.post('/reset', async (ctx: Context) => {
  await prisma.comment.deleteMany();
  await prisma.thread.deleteMany();
  await prisma.user.deleteMany();
  // オートインクリメントIDをリセット（SQLite用）
  await prisma.$executeRawUnsafe("DELETE FROM sqlite_sequence WHERE name='User'");
  await prisma.$executeRawUnsafe("DELETE FROM sqlite_sequence WHERE name='Thread'");
  await prisma.$executeRawUnsafe("DELETE FROM sqlite_sequence WHERE name='Comment'");
  ctx.body = { message: 'Database reset complete' };
});

// スレッドとコメントの木構造をHTMLで表示
router.get('/threads/html', async (ctx: Context) => {
  const threads = await prisma.thread.findMany({
    include: {
      user: true,
      comments: {
        include: { user: true },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  type CommentType = {
    id: number;
    content: string;
    parentId?: number | null;
    user?: { name?: string } | null;
    children?: CommentType[];
  };

  function buildCommentTree(comments: CommentType[]): CommentType[] {
    const map: { [key: number]: CommentType } = {};
    comments.forEach((c) => { map[c.id] = { ...c, children: [] }; });
    const roots: CommentType[] = [];
    comments.forEach((c) => {
      if (c.parentId) {
        map[c.parentId]?.children?.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });
    return roots;
  }

  function renderComments(comments: CommentType[]): string {
    return comments.map((c) => `
      <div style="margin-left:2em; border-left:1px solid #ccc; padding-left:0.5em;">
        <b>${c.user?.name || 'NoName'}</b>: ${c.content}
        ${c.children && c.children.length ? renderComments(c.children) : ''}
      </div>
    `).join('');
  }

  ctx.type = 'html';
  ctx.body = `
    <html><body>
      <h1>スレッド一覧（木構造表示）</h1>
      ${threads.map((thread: any) => `
        <div style="border:1px solid #888; margin-bottom:1em; padding:1em;">
          <b>${thread.title}</b> by ${thread.user?.name || 'NoName'}<br>
          <div>${thread.content}</div>
          <div>コメント:</div>
          ${renderComments(buildCommentTree(thread.comments as CommentType[]))}
        </div>
      `).join('')}
    </body></html>
  `;
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(4000, () => {
  console.log('Server is running on http://localhost:4000');
});