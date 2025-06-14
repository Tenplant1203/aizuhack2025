import Koa from 'koa';
import Router from '@koa/router';
import { PrismaClient } from '@prisma/client';

const app = new Koa();
const router = new Router();
const prisma = new PrismaClient();

interface Context extends Koa.Context {
  user?: any; // Define the user type as needed
}

router.get('/user', async (ctx: Context) => {
  ctx.body = await prisma.user.findMany();
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});