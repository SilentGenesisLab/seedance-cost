'use client';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const result = await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false,
      callbackUrl: searchParams.get('callbackUrl') ?? '/dashboard',
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError('邮箱或密码不正确。');
      return;
    }

    router.push(result?.url ?? '/dashboard');
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-black/30"
    >
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-300">
          Seedance Cost
        </p>
        <h1 className="mt-3 text-3xl font-semibold">管理员登录</h1>
        <p className="mt-3 text-sm text-slate-400">登录后查看 Seedance2.0 账户积分消耗记录。</p>
      </div>

      <label className="block text-sm font-medium text-slate-200" htmlFor="email">
        邮箱
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300"
      />

      <label className="mt-5 block text-sm font-medium text-slate-200" htmlFor="password">
        密码
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300"
      />

      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-8 w-full rounded-xl bg-cyan-300 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? '登录中...' : '登录'}
      </button>
    </form>
  );
}
