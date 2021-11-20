import Shopify from "shopify-api-node";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function generateShopifyApiInstance(store) {
  const merchantStore = await prisma.store.findFirst({
    where: { store_name: store },
  });

  if (merchantStore) {
    return new Shopify({
      shopName: merchantStore.store_name,
      accessToken: merchantStore.access_token,
    });
  }
}
