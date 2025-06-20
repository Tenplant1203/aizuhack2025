import Router from "@koa/router";
import { PrismaClient } from "@prisma/client";

const router = new Router({ prefix: "/users" });
const prisma = new PrismaClient();

router.post("/", async (ctx) => {
  const { name, email } = ctx.request.body as { name?: string; email?: string };

  if (!name || !email) {
    ctx.status = 400;
    ctx.body = { error: "name と email は必須です" };
    return;
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    ctx.status = 400;
    ctx.body = { error: "このメールアドレスは既に登録されています" };
    return;
  }

  const user = await prisma.user.create({
    data: { name, email },
  });

  ctx.status = 201;
  ctx.body = user;
});

router.get("/", async (ctx) => {
  const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
  ctx.body = users;
});

router.get("/:uid", async (ctx) => {
  const { uid } = ctx.params;
  const user = await prisma.user.findUnique({ where: { id: Number(uid) } });

  if (!user) {
    ctx.status = 404;
    ctx.body = { error: "そんな奴知らないよ！" };
  } else {
    const { name, id, createdAt } = user;
    ctx.status = 200;
    ctx.body = { name, id, createdAt };
  }
});

export default router;
