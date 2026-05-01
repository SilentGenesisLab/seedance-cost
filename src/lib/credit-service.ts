import { FetchRunStatus } from '@prisma/client';

import { parseCreditApiResponse } from '@/lib/credit-parser';
import { prisma } from '@/lib/prisma';

const DEFAULT_CREDIT_API_URL = 'https://chorify3.sligenai.cn/jmapi/credit';

export async function collectCreditSnapshots() {
  const sourceUrl = process.env.SEEDANCE_API_URL ?? DEFAULT_CREDIT_API_URL;
  const fetchRun = await prisma.fetchRun.create({
    data: {
      sourceUrl,
      status: FetchRunStatus.RUNNING,
    },
  });

  try {
    const response = await fetch(sourceUrl, {
      headers: {
        accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Credit API responded with HTTP ${response.status}`);
    }

    const payload: unknown = await response.json();
    const items = parseCreditApiResponse(payload);
    let successCount = 0;
    let anomalyCount = 0;

    for (const item of items) {
      const account = await prisma.seedanceAccount.upsert({
        where: { name: item.accountName },
        update: {},
        create: { name: item.accountName },
      });

      if (item.parsedCredit && !item.anomalyReason) {
        await prisma.creditSnapshot.create({
          data: {
            fetchRunId: fetchRun.id,
            accountId: account.id,
            vipCredit: item.parsedCredit.vip_credit,
            giftCredit: item.parsedCredit.gift_credit,
            purchaseCredit: item.parsedCredit.purchase_credit,
            totalCredit: item.parsedCredit.total_credit,
            fetchedAt: item.fetchedAt,
            rawStdout: item.stdout,
          },
        });
        successCount += 1;
        continue;
      }

      await prisma.anomalyEvent.create({
        data: {
          fetchRunId: fetchRun.id,
          accountId: account.id,
          accountName: item.accountName,
          reason: item.anomalyReason ?? 'Unknown credit parsing anomaly',
          exitCode: item.exitCode,
          stdout: item.stdout,
          stderr: item.stderr,
          fetchedAt: item.fetchedAt,
        },
      });
      anomalyCount += 1;
    }

    const status = anomalyCount === 0 ? FetchRunStatus.SUCCEEDED : FetchRunStatus.PARTIAL;

    return prisma.fetchRun.update({
      where: { id: fetchRun.id },
      data: {
        status,
        totalCount: items.length,
        successCount,
        anomalyCount,
        rawJson: JSON.stringify(payload),
        completedAt: new Date(),
      },
      include: {
        snapshots: true,
        anomalies: true,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown credit fetch failure';

    return prisma.fetchRun.update({
      where: { id: fetchRun.id },
      data: {
        status: FetchRunStatus.FAILED,
        errorMessage: message,
        completedAt: new Date(),
      },
      include: {
        snapshots: true,
        anomalies: true,
      },
    });
  }
}
