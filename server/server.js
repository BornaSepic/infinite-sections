import "@babel/polyfill";
import dotenv from "dotenv";
import "isomorphic-fetch";
import createShopifyAuth from "@shopify/koa-shopify-auth";
import Shopify, { ApiVersion } from "@shopify/shopify-api";
import Koa from "koa";
import next from "next";
import Router from "@koa/router";

import bodyParser from "koa-body";
import shopifyRouter from "./routes/routes-shopify";
import shopifyWebhooksRouter from "./routes/routes-webhooks-shopify";

import { PrismaClient } from "@prisma/client";
import { customSessionStorage } from "./session-storage/pg-session-storage";

const prisma = new PrismaClient();

dotenv.config();
const port = parseInt(process.env.PORT, 10) || 8080;

const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
});

const handle = app.getRequestHandler();

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES.split(","),
  HOST_NAME: process.env.HOST.replace(/https:\/\//, ""),
  API_VERSION: ApiVersion.October20,
  IS_EMBEDDED_APP: true,
  SESSION_STORAGE: new Shopify.Session.CustomSessionStorage(
    customSessionStorage.storeCallBack,
    customSessionStorage.loadCallback,
    customSessionStorage.deleteCallback
  ),
});

app.prepare().then(async () => {
  const server = new Koa();
  const router = new Router();

  server.use(
    bodyParser({
      urlencoded: true,
    })
  );

  server.keys = [Shopify.Context.API_SECRET_KEY];
  server.use(
    createShopifyAuth({
      accessMode: "offline",
      async afterAuth(ctx) {
        const { host } = ctx.query;
        // Access token and shop available in ctx.state.shopify
        const { shop, accessToken } = ctx.state.shopify;

        await prisma.store
          .upsert({
            where: {
              store_name: shop,
            },
            create: {
              store_name: shop,
              access_token: accessToken,
              scope: process.env.SCOPES.split(","),
            },
            update: {
              access_token: accessToken,
              scope: process.env.SCOPES.split(","),
              active: true,
            },
          })
          .catch((err) => {
            console.log("While updating/creating store", err);
          });

        const uninstallWebhookHandler = await Shopify.Webhooks.Registry.register(
          {
            shop,
            accessToken,
            path: "/webhooks/shopify/uninstall",
            topic: "APP_UNINSTALLED",
            webhookHandler: async (_topic, shop) => {
              console.log("Uninstall handler ran", _topic, shop);
              return new Promise(async (resolve, reject) => {
                prisma.store
                  .update({
                    where: {
                      store_name: shop,
                    },
                    data: {
                      active: false,
                    },
                  })
                  .then(() => resolve())
                  .catch(() => {
                    console.log("ERROR REMOVING APP FOR: ", shop);
                    reject();
                  });
              });
            },
          }
        );

        if (!uninstallWebhookHandler.success) {
          console.log(
            `Failed to register webhooks: ${uninstallWebhookHandler.result}`
          );
        }

        // Redirect to app with shop parameter upon auth
        ctx.redirect(`/?shop=${shop}&host=${host}`);
      },
    })
  );

  const handleRequest = async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  };

  server.use(shopifyWebhooksRouter.routes());

  router.get("/", async (ctx) => {
    const shop = ctx.query.shop;
    const host = ctx.query.host;

    // This shop hasn't been seen yet, go through OAuth to create a session
    const store = await prisma.store.findFirst({
      where: { store_name: shop },
    });

    if (!store || !store.active) {
      ctx.redirect(`/auth?shop=${shop}&host=${host}`);
    } else {
      await handleRequest(ctx);
    }
  });

  server.use(shopifyRouter.routes());

  router.post("/webhooks", async (ctx) => {
    try {
      await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (error) {
      console.log(`Failed to process webhook: ${error}`);
    }
  });

  router.get("(/_next/static/.*)", handleRequest); // Static content is clear
  router.get("/_next/webpack-hmr", handleRequest); // Webpack content is clear

  router.get("/(.*)", async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  });

  server.use(router.routes());
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
