import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';

import { authOptions } from '@/lib/auth';
import { getAccountDetail } from '@/lib/dashboard-data';

function formatNumber(value: number | null | undefined) {
  return value === null || value === undefined
    ? '--'
    : new Intl.NumberFormat('zh-CN').format(value);
}

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function formatDateTime(value: Date) {
  return value.toISOString().replace('T', ' ').slice(0, 16);
}

export default async function AccountDetailPage({ params }: { params: { accountId: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/login?callbackUrl=/dashboard/accounts/${params.accountId}`);
  }

  const account = await getAccountDetail(params.accountId);

  if (!account) {
    notFound();
  }

  const latestSnapshot = account.snapshots[0];

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <Link href="/dashboard" className="text-sm font-medium text-cyan-200 hover:underline">
          返回仪表盘
        </Link>
        <header className="mt-6 border-b border-slate-800 pb-8">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-300">
            Account Detail
          </p>
          <h1 className="mt-3 text-4xl font-semibold">{account.name}</h1>
          <p className="mt-3 text-slate-400">
            当前余额：{formatNumber(latestSnapshot?.totalCredit)}，最近抓取：
            {latestSnapshot ? formatDateTime(latestSnapshot.fetchedAt) : '--'}
          </p>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-xl font-semibold">近 30 日消耗</h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900 text-slate-400">
                  <tr>
                    <th className="px-4 py-3">日期</th>
                    <th className="px-4 py-3">消耗</th>
                    <th className="px-4 py-3">Reset</th>
                  </tr>
                </thead>
                <tbody>
                  {account.dailyUsages.length === 0 ? (
                    <tr className="border-t border-slate-800 text-slate-500">
                      <td className="px-4 py-6" colSpan={3}>
                        暂无消耗记录。
                      </td>
                    </tr>
                  ) : (
                    account.dailyUsages.map((usage) => (
                      <tr key={usage.id} className="border-t border-slate-800 text-slate-300">
                        <td className="px-4 py-4">{formatDate(usage.date)}</td>
                        <td className="px-4 py-4">{formatNumber(usage.usage)}</td>
                        <td className="px-4 py-4">
                          {usage.resetDetected ? `是 (${usage.resetCount})` : '否'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-xl font-semibold">最近快照</h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900 text-slate-400">
                  <tr>
                    <th className="px-4 py-3">抓取时间</th>
                    <th className="px-4 py-3">总积分</th>
                    <th className="px-4 py-3">VIP/Gift/Purchase</th>
                  </tr>
                </thead>
                <tbody>
                  {account.snapshots.length === 0 ? (
                    <tr className="border-t border-slate-800 text-slate-500">
                      <td className="px-4 py-6" colSpan={3}>
                        暂无快照。
                      </td>
                    </tr>
                  ) : (
                    account.snapshots.map((snapshot) => (
                      <tr key={snapshot.id} className="border-t border-slate-800 text-slate-300">
                        <td className="px-4 py-4">{formatDateTime(snapshot.fetchedAt)}</td>
                        <td className="px-4 py-4">{formatNumber(snapshot.totalCredit)}</td>
                        <td className="px-4 py-4">
                          {snapshot.vipCredit}/{snapshot.giftCredit}/{snapshot.purchaseCredit}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
