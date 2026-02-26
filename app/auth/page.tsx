'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Compass } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// useSearchParams() requires a Suspense boundary during static rendering
export default function AuthPage() {
  return (
    <Suspense>
      <AuthContent />
    </Suspense>
  );
}

function AuthContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const next         = searchParams.get('next') ?? '/';

  const [tab, setTab]           = useState<'signin' | 'signup'>('signin');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [message, setMessage]   = useState<string | null>(null);

  // Redirect if already signed in
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace(next);
    });
  }, [next, router]);

  const inputCls =
    'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-slate-900 placeholder-gray-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100';

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();

    if (tab === 'signup') {
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
      });
      if (err) {
        setError(err.message);
      } else {
        setMessage('שלחנו לך אימייל לאימות. בדוק את תיבת הדואר שלך.');
      }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) {
        setError('אימייל או סיסמה שגויים');
      } else {
        router.replace(next);
      }
    }

    setLoading(false);
  }

  async function handleGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f8f9fb] px-4" dir="rtl">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <a href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="text-2xl font-black tracking-tight text-slate-800">צייד הדילים</span>
          <Compass className="h-7 w-7 shrink-0 text-orange-600" strokeWidth={1.5} />
        </a>

        <div className="rounded-2xl bg-white p-8 shadow-[0_2px_16px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.04]">
          {/* Tabs */}
          <div className="mb-6 flex rounded-xl bg-gray-100 p-1">
            <button
              onClick={() => { setTab('signin'); setError(null); setMessage(null); }}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                tab === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              כניסה
            </button>
            <button
              onClick={() => { setTab('signup'); setError(null); setMessage(null); }}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                tab === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              הרשמה
            </button>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">אימייל</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputCls}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">סיסמה</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="לפחות 6 תווים"
                className={inputCls}
                required
                minLength={6}
              />
            </div>

            {error   && <p className="text-sm font-medium text-red-500">{error}</p>}
            {message && <p className="text-sm font-medium text-emerald-600">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-orange-600 py-3 text-sm font-black text-white shadow-sm transition-all hover:bg-orange-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {tab === 'signin' ? 'מתחבר...' : 'נרשם...'}
                </span>
              ) : tab === 'signin' ? 'כניסה' : 'הרשמה'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <hr className="flex-1 border-gray-200" />
            <span className="text-xs text-gray-400">או</span>
            <hr className="flex-1 border-gray-200" />
          </div>

          {/* Google OAuth */}
          <button
            onClick={handleGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98]"
          >
            {/* Google icon */}
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            המשך עם גוגל
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-400">
          <a href="/" className="font-medium text-orange-600 hover:text-orange-500">
            ← חזור לדף הבית
          </a>
        </p>
      </div>
    </main>
  );
}
