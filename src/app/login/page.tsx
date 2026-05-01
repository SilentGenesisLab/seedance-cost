import { Suspense } from 'react';

import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <Suspense fallback={<div className="text-sm text-slate-400">加载登录表单...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
