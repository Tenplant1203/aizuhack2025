import Router from "@koa/router";
import { PrismaClient } from "@prisma/client";
import Koa from "koa";

import { createReadStream } from "fs";

const router = new Router();
const prisma = new PrismaClient();

interface Context extends Koa.Context {
  user?: any;
}

// ルートエンドポイント
router.get("/", async (ctx: Context) => {
  ctx.type = "html";
  ctx.body = createReadStream("src/routes/root.html");
});

export default router;
