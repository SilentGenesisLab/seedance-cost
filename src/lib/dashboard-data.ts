import { prisma } from '@/lib/prisma';

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function daysAgo(days: number) {
  const date = startOfUtcDay(new Date());
  date.setUTCDate(date.getUTCDate() - days);
  return date;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getDashboardData() {
  const today = startOfUtcDay(new Date());
  const thirtyDaysAgo = daysAgo(29);

  const [todayUsage, activeAccounts, anomaliesToday, dailyUsages, accounts] = await Promise.all([
    prisma.dailyUsage.aggregate({
      where: { date: today },
      _sum: { usage: true, resetCount: true },
    }),
    prisma.seedanceAccount.count(),
    prisma.anomalyEvent.count({
      where: { fetchedAt: { gte: today } },
    }),
    prisma.dailyUsage.findMany({
      where: { date: { gte: thirtyDaysAgo } },
      orderBy: [{ date: 'asc' }, { accountName: 'asc' }],
    }),
    prisma.seedanceAccount.findMany({
      orderBy: { name: 'asc' },
      include: {
        snapshots: {
          orderBy: { fetchedAt: 'desc' },
          take: 1,
        },
        dailyUsages: {
          where: { date: today },
          take: 1,
        },
        anomalies: {
          where: { fetchedAt: { gte: today } },
          take: 1,
        },
      },
    }),
  ]);

  const trendByDate = new Map<string, { date: string; usage: number; resetCount: number }>();

  for (let offset = 29; offset >= 0; offset -= 1) {
    const date = daysAgo(offset);
    trendByDate.set(formatDate(date), { date: formatDate(date), usage: 0, resetCount: 0 });
  }

  for (const usage of dailyUsages) {
    const key = formatDate(usage.date);
    const trend = trendByDate.get(key);

    if (trend) {
      trend.usage += usage.usage;
      trend.resetCount += usage.resetCount;
    }
  }

  const trend30d = Array.from(trendByDate.values());
  const trend7d = trend30d.slice(-7);
  const accountRows = accounts.map((account) => {
    const latestSnapshot = account.snapshots[0];
    const usage = account.dailyUsages[0];

    return {
      id: account.id,
      name: account.name,
      todayUsage: usage?.usage ?? 0,
      currentBalance: latestSnapshot?.totalCredit ?? null,
      resetDetected: usage?.resetDetected ?? false,
      resetCount: usage?.resetCount ?? 0,
      hasAnomalyToday: account.anomalies.length > 0,
      fetchedAt: latestSnapshot?.fetchedAt ?? null,
    };
  });

  return {
    metrics: {
      todayUsage: todayUsage._sum.usage ?? 0,
      currentBalance: accountRows.reduce((sum, account) => sum + (account.currentBalance ?? 0), 0),
      activeAccounts,
      anomaliesToday,
      resetCountToday: todayUsage._sum.resetCount ?? 0,
    },
    trend7d,
    trend30d,
    accounts: accountRows,
  };
}

export async function getAccountDetail(accountId: string) {
  return prisma.seedanceAccount.findUnique({
    where: { id: accountId },
    include: {
      snapshots: {
        orderBy: { fetchedAt: 'desc' },
        take: 30,
      },
      dailyUsages: {
        orderBy: { date: 'desc' },
        take: 30,
      },
      anomalies: {
        orderBy: { fetchedAt: 'desc' },
        take: 20,
      },
    },
  });
}

export async function getAnomalyList(take = 100) {
  return prisma.anomalyEvent.findMany({
    orderBy: { fetchedAt: 'desc' },
    take,
    include: {
      account: true,
      fetchRun: true,
    },
  });
}
