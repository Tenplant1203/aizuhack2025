import Koa from "koa";
import cors from "@koa/cors";
import bodyParser from "koa-bodyparser";
import Router from "@koa/router";

import threadsRouter from "./routes/threads";
import commentsRouter from "./routes/comments";
import usersRouter from "./routes/users";

const app = new Koa();
const router = new Router();

app.use(
  cors({
    origin: "http://localhost:3000",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(bodyParser());

app.use(router.routes()).use(router.allowedMethods());

app.listen(process.env.PORT || 4000, () => {
  console.log(`API listening on http://localhost:${process.env.PORT || 4000}`);
});

app.use(threadsRouter.routes());
app.use(commentsRouter.routes());
app.use(usersRouter.routes());

router.get("/", async (ctx) => {
  ctx.body = { status: "OK" };
});
