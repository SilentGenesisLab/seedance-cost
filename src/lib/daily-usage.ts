import { Prisma, type CreditSnapshot, type SeedanceAccount } from '@prisma/client';

import { prisma } from '@/lib/prisma';

const RESET_MIN_TOTAL = 14500;
const RESET_MAX_TOTAL = 15000;
const RESET_COOLDOWN_HOURS = 12;

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function isResetCandidate(currentTotal: number) {
  return currentTotal >= RESET_MIN_TOTAL && currentTotal <= RESET_MAX_TOTAL;
}

async function hasRecentReset(accountId: string, fetchedAt: Date) {
  const cooldownStartedAt = new Date(fetchedAt.getTime() - RESET_COOLDOWN_HOURS * 60 * 60 * 1000);
  const recentReset = await prisma.dailyUsage.findFirst({
    where: {
      accountId,
      resetDetected: true,
      resetDetectedAt: {
        gte: cooldownStartedAt,
      },
    },
    select: {
      id: true,
    },
  });

  return Boolean(recentReset);
}

type SnapshotWithAccount = CreditSnapshot & {
  account: SeedanceAccount;
};

export async function calculateDailyUsageForSnapshot(
  snapshot: SnapshotWithAccount,
  fetchRunId: string
) {
  const previousSnapshot = await prisma.creditSnapshot.findFirst({
    where: {
      accountId: snapshot.accountId,
      fetchedAt: {
        lt: snapshot.fetchedAt,
      },
    },
    orderBy: {
      fetchedAt: 'desc',
    },
  });

  if (!previousSnapshot) {
    return null;
  }

  const delta = previousSnapshot.totalCredit - snapshot.totalCredit;
  const usageDate = startOfUtcDay(snapshot.fetchedAt);

  if (delta >= 0) {
    return prisma.dailyUsage.upsert({
      where: {
        accountId_date: {
          accountId: snapshot.accountId,
          date: usageDate,
        },
      },
      update: {
        usage: {
          increment: delta,
        },
        accountName: snapshot.account.name,
        previousSnapshotId: previousSnapshot.id,
        currentSnapshotId: snapshot.id,
        previousTotal: previousSnapshot.totalCredit,
        currentTotal: snapshot.totalCredit,
      },
      create: {
        accountId: snapshot.accountId,
        accountName: snapshot.account.name,
        date: usageDate,
        usage: delta,
        previousSnapshotId: previousSnapshot.id,
        currentSnapshotId: snapshot.id,
        previousTotal: previousSnapshot.totalCredit,
        currentTotal: snapshot.totalCredit,
      },
    });
  }

  const resetDetected =
    isResetCandidate(snapshot.totalCredit) &&
    !(await hasRecentReset(snapshot.accountId, snapshot.fetchedAt));

  if (resetDetected) {
    return prisma.dailyUsage.upsert({
      where: {
        accountId_date: {
          accountId: snapshot.accountId,
          date: usageDate,
        },
      },
      update: {
        accountName: snapshot.account.name,
        resetDetected: true,
        resetCount: {
          increment: 1,
        },
        resetDetectedAt: snapshot.fetchedAt,
        previousSnapshotId: previousSnapshot.id,
        currentSnapshotId: snapshot.id,
        previousTotal: previousSnapshot.totalCredit,
        currentTotal: snapshot.totalCredit,
      },
      create: {
        accountId: snapshot.accountId,
        accountName: snapshot.account.name,
        date: usageDate,
        usage: 0,
        resetDetected: true,
        resetCount: 1,
        resetDetectedAt: snapshot.fetchedAt,
        previousSnapshotId: previousSnapshot.id,
        currentSnapshotId: snapshot.id,
        previousTotal: previousSnapshot.totalCredit,
        currentTotal: snapshot.totalCredit,
      },
    });
  }

  await prisma.anomalyEvent.create({
    data: {
      fetchRunId,
      accountId: snapshot.accountId,
      accountName: snapshot.account.name,
      reason: `Credit total increased from ${previousSnapshot.totalCredit} to ${snapshot.totalCredit} without reset detection`,
      stdout: snapshot.rawStdout,
      stderr: '',
      fetchedAt: snapshot.fetchedAt,
    },
  });

  return null;
}

export async function listDailyUsageSummary(take = 30) {
  return prisma.dailyUsage.findMany({
    orderBy: [{ date: 'desc' }, { accountName: 'asc' }],
    take,
  });
}

export type DailyUsageSummary = Prisma.PromiseReturnType<typeof listDailyUsageSummary>;
