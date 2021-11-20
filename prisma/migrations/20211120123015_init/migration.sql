-- CreateTable
CREATE TABLE "Store" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "store_name" VARCHAR(255) NOT NULL,
    "access_token" VARCHAR(255) NOT NULL,
    "scope" TEXT[],
    "plan" TEXT NOT NULL DEFAULT E'FREE',
    "active" BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY ("store_name")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "shop" VARCHAR(255) NOT NULL,
    "state" VARCHAR(255) NOT NULL,
    "expires" TIMESTAMP(3),
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "accessToken" VARCHAR(255),
    "onlineAccessInfo" TEXT,
    "scope" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schema" (
    "id" SERIAL NOT NULL,
    "store_name" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sectionId" VARCHAR(255) NOT NULL,
    "sectionLabel" VARCHAR(255) NOT NULL DEFAULT E'',
    "schema" JSONB NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gdprWebhook" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "data" TEXT,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Schema" ADD FOREIGN KEY ("store_name") REFERENCES "Store"("store_name") ON DELETE CASCADE ON UPDATE CASCADE;
