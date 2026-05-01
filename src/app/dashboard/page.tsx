import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { UsageTrendChart } from '@/components/usage-trend-chart';
import { authOptions } from '@/lib/auth';
import { getDashboardData } from '@/lib/dashboard-data';

function formatNumber(value: number | null) {
  return value === null ? '--' : new Intl.NumberFormat('zh-CN').format(value);
}

function formatDateTime(value: Date | null) {
  return value ? value.toISOString().replace('T', ' ').slice(0, 16) : '--';
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/dashboard');
  }

  const data = await getDashboardData();
  const metricCards = [
    { label: '今日总消耗', value: formatNumber(data.metrics.todayUsage), hint: '基于相邻快照差值' },
    {
      label: '当前总余额',
      value: formatNumber(data.metrics.currentBalance),
      hint: '各账户最新 total_credit 汇总',
    },
    {
      label: '活跃账户数',
      value: formatNumber(data.metrics.activeAccounts),
      hint: '已采集账户数量',
    },
    {
      label: '今日异常数',
      value: formatNumber(data.metrics.anomaliesToday),
      hint: '解析、exit_code、非重置上涨异常',
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 border-b border-slate-800 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-300">
              Seedance Cost
            </p>
            <h1 className="mt-3 text-4xl font-semibold">消耗记录仪表盘</h1>
            <p className="mt-3 text-slate-400">已登录：{session.user?.email}</p>
          </div>
          <nav className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/anomalies"
              className="rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold hover:border-slate-500"
            >
              异常列表
            </Link>
            <a
              href="/api/auth/signout"
              className="rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold hover:border-slate-500"
            >
              退出登录
            </a>
          </nav>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          {metricCards.map((card) => (
            <article
              key={card.label}
              className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6"
            >
              <p className="text-sm text-slate-400">{card.label}</p>
              <p className="mt-4 text-3xl font-semibold">{card.value}</p>
              <p className="mt-3 text-sm text-slate-500">{card.hint}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-xl font-semibold">近 7 天消耗趋势</h2>
            <UsageTrendChart data={data.trend7d} />
          </article>
          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-xl font-semibold">近 30 天消耗趋势</h2>
            <UsageTrendChart data={data.trend30d} />
          </article>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">账户今日明细</h2>
              <p className="mt-2 text-sm text-slate-400">
                展示各账户今日消耗、当前余额和 reset 标记。
              </p>
            </div>
            <span className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-300">
              今日 reset：{data.metrics.resetCountToday}
            </span>
          </div>
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-900 text-slate-400">
                <tr>
                  <th className="px-4 py-3">账户</th>
                  <th className="px-4 py-3">今日消耗</th>
                  <th className="px-4 py-3">当前余额</th>
                  <th className="px-4 py-3">Reset</th>
                  <th className="px-4 py-3">异常</th>
                  <th className="px-4 py-3">最近抓取</th>
                </tr>
              </thead>
              <tbody>
                {data.accounts.length === 0 ? (
                  <tr className="border-t border-slate-800 text-slate-500">
                    <td className="px-4 py-6" colSpan={6}>
                      暂无账户数据。
                    </td>
                  </tr>
                ) : (
                  data.accounts.map((account) => (
                    <tr key={account.id} className="border-t border-slate-800 text-slate-300">
                      <td className="px-4 py-4">
                        <Link
                          className="font-medium text-cyan-200 hover:underline"
                          href={`/dashboard/accounts/${account.id}`}
                        >
                          {account.name}
                        </Link>
                      </td>
                      <td className="px-4 py-4">{formatNumber(account.todayUsage)}</td>
                      <td className="px-4 py-4">{formatNumber(account.currentBalance)}</td>
                      <td className="px-4 py-4">
                        {account.resetDetected ? `是 (${account.resetCount})` : '否'}
                      </td>
                      <td className="px-4 py-4">{account.hasAnomalyToday ? '有' : '无'}</td>
                      <td className="px-4 py-4">{formatDateTime(account.fetchedAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
