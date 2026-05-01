import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/lib/auth';
import { getAnomalyList } from '@/lib/dashboard-data';

function formatDateTime(value: Date) {
  return value.toISOString().replace('T', ' ').slice(0, 16);
}

export default async function AnomaliesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/dashboard/anomalies');
  }

  const anomalies = await getAnomalyList();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <Link href="/dashboard" className="text-sm font-medium text-cyan-200 hover:underline">
          返回仪表盘
        </Link>
        <header className="mt-6 border-b border-slate-800 pb-8">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-red-300">Anomalies</p>
          <h1 className="mt-3 text-4xl font-semibold">异常列表</h1>
          <p className="mt-3 text-slate-400">
            包含 exit_code 非 0、stdout 解析失败、非重置上涨等异常。
          </p>
        </header>

        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="bg-slate-900 text-slate-400">
              <tr>
                <th className="px-4 py-3">时间</th>
                <th className="px-4 py-3">账户</th>
                <th className="px-4 py-3">原因</th>
                <th className="px-4 py-3">exit_code</th>
                <th className="px-4 py-3">stderr</th>
              </tr>
            </thead>
            <tbody>
              {anomalies.length === 0 ? (
                <tr className="border-t border-slate-800 text-slate-500">
                  <td className="px-4 py-6" colSpan={5}>
                    暂无异常。
                  </td>
                </tr>
              ) : (
                anomalies.map((anomaly) => (
                  <tr key={anomaly.id} className="border-t border-slate-800 text-slate-300">
                    <td className="px-4 py-4">{formatDateTime(anomaly.fetchedAt)}</td>
                    <td className="px-4 py-4">
                      {anomaly.account ? (
                        <Link
                          className="text-cyan-200 hover:underline"
                          href={`/dashboard/accounts/${anomaly.account.id}`}
                        >
                          {anomaly.accountName}
                        </Link>
                      ) : (
                        anomaly.accountName
                      )}
                    </td>
                    <td className="px-4 py-4">{anomaly.reason}</td>
                    <td className="px-4 py-4">{anomaly.exitCode ?? '--'}</td>
                    <td className="px-4 py-4 text-slate-400">{anomaly.stderr || '--'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
