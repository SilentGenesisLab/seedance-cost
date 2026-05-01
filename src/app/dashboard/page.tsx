import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/lib/auth';

const metricCards = [
  { label: '当前总积分', value: '--', hint: '等待 credit 接口接入' },
  { label: '今日消耗', value: '--', hint: '基于快照差值计算' },
  { label: '异常账户', value: '--', hint: 'exit_code != 0' },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/dashboard');
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 border-b border-slate-800 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-300">
              Seedance Cost
            </p>
            <h1 className="mt-3 text-4xl font-semibold">消耗记录仪表盘</h1>
            <p className="mt-3 text-slate-400">已登录：{session.user?.email}</p>
          </div>
          <a
            href="/api/auth/signout"
            className="rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold hover:border-slate-500"
          >
            退出登录
          </a>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {metricCards.map((card) => (
            <article
              key={card.label}
              className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6"
            >
              <p className="text-sm text-slate-400">{card.label}</p>
              <p className="mt-4 text-4xl font-semibold">{card.value}</p>
              <p className="mt-3 text-sm text-slate-500">{card.hint}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">账户积分快照</h2>
              <p className="mt-2 text-sm text-slate-400">
                credit 接口接入后将在此展示 vip、gift、purchase、total credit。
              </p>
            </div>
            <span className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-300">
              MVP 占位
            </span>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900 text-slate-400">
                <tr>
                  <th className="px-4 py-3">账户</th>
                  <th className="px-4 py-3">总积分</th>
                  <th className="px-4 py-3">状态</th>
                  <th className="px-4 py-3">抓取时间</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-800 text-slate-500">
                  <td className="px-4 py-6" colSpan={4}>
                    暂无数据，等待后续 credit 接口采集任务写入。
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
