import Router from "@koa/router";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const shopifyWebhooksRouter = new Router({ prefix: "/webhooks/shopify" });

shopifyWebhooksRouter.post("/uninstall", async (ctx, next) => {
  ctx.body = "200 OK";
  const storeName = ctx.request.get("x-shopify-shop-domain");
  const body = ctx.request.body;
  console.log("App removed", body);
  prisma.store
    .update({
      where: {
        store_name: body.myshopify_domain,
      },
      data: {
        active: false,
      },
    })
    .then(() => {
      console.log("APP DISABLED", storeName);

      prisma.session
        .deleteMany({
          where: {
            shop: storeName,
          },
        })
        .then(() => console.log("SESSION REMOVED", storeName));
    })
    .catch((err) => {
      console.log("ERROR REMOVING APP FOR: ", storeName, err);
    });
});

shopifyWebhooksRouter.post("/customer-data-request", async (ctx, next) => {
  ctx.body = "200 OK";
  prisma.gdprWebhook.create({
    data: {
      data: JSON.stringify(ctx.request.body),
    },
  });
});
shopifyWebhooksRouter.post("/customer-data-removal", async (ctx, next) => {
  ctx.body = "200 OK";
  prisma.gdprWebhook.create({
    data: {
      data: JSON.stringify(ctx.request.body),
    },
  });
});
shopifyWebhooksRouter.post("/shop-data-removal", async (ctx, next) => {
  ctx.body = "200 OK";
  prisma.gdprWebhook.create({
    data: {
      data: JSON.stringify(ctx.request.body),
    },
  });
});

export default shopifyWebhooksRouter;
