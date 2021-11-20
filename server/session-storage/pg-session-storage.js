import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

export const customSessionStorage = {
  storeCallBack: (session) => {
    return new Promise(async (resolve, reject) => {
      const storedSession = await prisma.session.upsert({
        where: {
          id: session.id,
        },
        update: {
          id: session.id,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          shop: session.shop,
          scope: session.scope,
          state: session.state,
          expires: session.expires,
          isOnline: session.isOnline,
          accessToken: session.accessToken,
          onlineAccessInfo: session.onlineAccessInfo
            ? JSON.stringify(session.onlineAccessInfo)
            : undefined,
        },
        create: {
          id: session.id,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          shop: session.shop,
          scope: session.scope,
          state: session.state,
          expires: session.expires,
          isOnline: session.isOnline,
          accessToken: session.accessToken,
          onlineAccessInfo: session.onlineAccessInfo
            ? JSON.stringify(session.onlineAccessInfo)
            : undefined,
        },
      });

      resolve(!!storedSession);
    });
  },
  loadCallback: (id) => {
    return new Promise(async (resolve, reject) => {
      const session = await prisma.session.findUnique({
        where: {
          id: id,
        },
      });

      if (session) {
        resolve({
          id: session.id,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          shop: session.shop,
          scope: session.scope,
          state: session.state,
          expires: new Date(session.expires),
          isOnline: session.isOnline,
          accessToken: session.accessToken,
          onlineAccessInfo: session.onlineAccessInfo
            ? JSON.parse(session.onlineAccessInfo)
            : undefined,
        });
      } else {
        reject(undefined);
      }
    });
  },
  deleteCallback: (id) => {
    return new Promise(async (resolve, reject) => {
      const deletedSession = await prisma.user.delete({
        where: {
          id: id,
        },
      });

      resolve(!deletedSession);
    });
  },
};
