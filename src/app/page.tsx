import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-slate-100">
      <section className="mx-auto flex max-w-5xl flex-col items-start gap-8">
        <div className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-200">
          Seedance2.0 Cost Dashboard
        </div>
        <div className="max-w-3xl">
          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
            可视化各账户积分消耗记录
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            MVP 聚焦 Seedance2.0 消耗记录和账户余额快照，后续将接入 credit 接口自动采集数据。
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/dashboard"
            className="rounded-full bg-cyan-300 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            进入仪表盘
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-slate-700 px-6 py-3 font-semibold text-slate-200 transition hover:border-slate-500"
          >
            管理员登录
          </Link>
        </div>
      </section>
    </main>
  );
}
