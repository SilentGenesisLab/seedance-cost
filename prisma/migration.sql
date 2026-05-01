-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "FetchRunStatus" AS ENUM ('RUNNING', 'SUCCEEDED', 'PARTIAL', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "SeedanceAccount" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeedanceAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FetchRun" (
    "id" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "status" "FetchRunStatus" NOT NULL DEFAULT 'RUNNING',
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "anomalyCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "rawJson" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "FetchRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditSnapshot" (
    "id" TEXT NOT NULL,
    "fetchRunId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "vipCredit" INTEGER NOT NULL,
    "giftCredit" INTEGER NOT NULL,
    "purchaseCredit" INTEGER NOT NULL,
    "totalCredit" INTEGER NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL,
    "rawStdout" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyUsage" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "usage" INTEGER NOT NULL DEFAULT 0,
    "resetDetected" BOOLEAN NOT NULL DEFAULT false,
    "resetCount" INTEGER NOT NULL DEFAULT 0,
    "resetDetectedAt" TIMESTAMP(3),
    "previousSnapshotId" TEXT,
    "currentSnapshotId" TEXT,
    "previousTotal" INTEGER,
    "currentTotal" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnomalyEvent" (
    "id" TEXT NOT NULL,
    "fetchRunId" TEXT NOT NULL,
    "accountId" TEXT,
    "accountName" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "exitCode" INTEGER,
    "stdout" TEXT NOT NULL,
    "stderr" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnomalyEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "SeedanceAccount_name_key" ON "SeedanceAccount"("name");

-- CreateIndex
CREATE INDEX "FetchRun_startedAt_idx" ON "FetchRun"("startedAt");

-- CreateIndex
CREATE INDEX "FetchRun_status_idx" ON "FetchRun"("status");

-- CreateIndex
CREATE INDEX "CreditSnapshot_accountId_fetchedAt_idx" ON "CreditSnapshot"("accountId", "fetchedAt");

-- CreateIndex
CREATE INDEX "CreditSnapshot_fetchRunId_idx" ON "CreditSnapshot"("fetchRunId");

-- CreateIndex
CREATE INDEX "CreditSnapshot_fetchedAt_idx" ON "CreditSnapshot"("fetchedAt");

-- CreateIndex
CREATE INDEX "DailyUsage_accountName_date_idx" ON "DailyUsage"("accountName", "date");

-- CreateIndex
CREATE INDEX "DailyUsage_date_idx" ON "DailyUsage"("date");

-- CreateIndex
CREATE INDEX "DailyUsage_resetDetectedAt_idx" ON "DailyUsage"("resetDetectedAt");

-- CreateIndex
CREATE UNIQUE INDEX "DailyUsage_accountId_date_key" ON "DailyUsage"("accountId", "date");

-- CreateIndex
CREATE INDEX "AnomalyEvent_accountName_fetchedAt_idx" ON "AnomalyEvent"("accountName", "fetchedAt");

-- CreateIndex
CREATE INDEX "AnomalyEvent_fetchRunId_idx" ON "AnomalyEvent"("fetchRunId");

-- CreateIndex
CREATE INDEX "AnomalyEvent_fetchedAt_idx" ON "AnomalyEvent"("fetchedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SystemConfig_key_key" ON "SystemConfig"("key");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditSnapshot" ADD CONSTRAINT "CreditSnapshot_fetchRunId_fkey" FOREIGN KEY ("fetchRunId") REFERENCES "FetchRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditSnapshot" ADD CONSTRAINT "CreditSnapshot_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "SeedanceAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyUsage" ADD CONSTRAINT "DailyUsage_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "SeedanceAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnomalyEvent" ADD CONSTRAINT "AnomalyEvent_fetchRunId_fkey" FOREIGN KEY ("fetchRunId") REFERENCES "FetchRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnomalyEvent" ADD CONSTRAINT "AnomalyEvent_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "SeedanceAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

