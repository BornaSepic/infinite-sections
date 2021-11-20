import Router from "@koa/router";
import Shopify from "@shopify/shopify-api";
import { PrismaClient } from "@prisma/client";
import { createClient, getSubscriptionData } from "../handlers";
import { generateShopifyApiInstance } from "../controllers/ShopifyController";

const prisma = new PrismaClient();

const apiRouter = new Router({ prefix: "/api/shopify" });

apiRouter.get("/plan", async (ctx, next) => {
  const session = await Shopify.Utils.loadCurrentSession(
    ctx.req,
    ctx.res,
    false
  );
  if (session) {
    console.log(session);
    const { plan, host } = ctx.query;

    const client = await createClient(session.shop, session.accessToken);
    const subscriptionData = await getSubscriptionData(
      ctx,
      client,
      plan || "PRO",
      session.shop,
      host
    );

    ctx.body = {
      success: true,
      url: subscriptionData.confirmationUrl,
    };
  } else {
    ctx.body = {
      success: false,
      error: "NO_SESSION_FOUND",
    };
  }
});

apiRouter.get("/apply_plan/:plan_name", async (ctx, next) => {
  const session = await Shopify.Utils.loadCurrentSession(
    ctx.req,
    ctx.res,
    false
  );
  if (session) {
    const { plan_name } = ctx.params;

    const store_information = await prisma.store
      .update({
        where: {
          store_name: session.shop,
        },
        data: {
          plan: plan_name,
        },
      })
      .then((res) => console.log(res));

    console.log(store_information);

    ctx.redirect("/");
  } else {
    ctx.body = {
      success: false,
      error: "NO_SESSION_FOUND",
    };
  }
});

apiRouter.get("/verify-plan", async (ctx, next) => {
  const session = await Shopify.Utils.loadCurrentSession(
    ctx.req,
    ctx.res,
    false
  );
  if (session) {
    const shopify = await generateShopifyApiInstance(session.shop);

    const activeSubscription = await shopify.graphql(`query {
      appInstallation {
        activeSubscriptions {
          name
          status
          test
          lineItems {
            id
            plan {
              pricingDetails
            }
          }
        }
      }
    }`);

    if (
      activeSubscription.appInstallation &&
      activeSubscription.appInstallation.activeSubscriptions &&
      activeSubscription.appInstallation.activeSubscriptions.length
    ) {
      const subscription =
        activeSubscription.appInstallation.activeSubscriptions[0];
      await prisma.store.update({
        where: {
          store_name: session.shop,
        },
        data: {
          plan: subscription.status === "ACTIVE" ? subscription.name : "FREE",
        },
      });
    } else {
      await prisma.store.update({
        where: {
          store_name: session.shop,
        },
        data: {
          plan: "FREE",
        },
      });
    }

    ctx.body = {
      success: true,
      data: activeSubscription,
    };
  } else {
    ctx.body = {
      success: false,
      error: "NO_SESSION_FOUND",
    };
  }
});

export default apiRouter;
