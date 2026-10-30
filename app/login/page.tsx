'use client';
export const dynamic = 'force-dynamic';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('student@example.com');
  const [password, setPassword] = useState('Password123!');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr('');

    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const x = await r.json();
      if (!r.ok) {
        setErr(x.error);
        setLoading(false);
        return;
      }
      window.dispatchEvent(new Event('auth-change'));
      router.refresh();
      if (x.user?.role === 'ADMIN' || x.user?.role === 'INSTRUCTOR') {
        router.push('/admin');
      } else {
        router.push(params.get('next') || '/dashboard');
      }
    } catch {
      setErr('An error occurred during sign in');
      setLoading(false);
    }
  }

  return (
    <div className="login-shell">
      <div className="login-art">
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
          alt="Learning"
        />
      </div>
      <div className="auth">
        <div className="auth-box">
          <Link href="/" style={{ display: 'inline-block', marginBottom: 20 }}>
            <img
              src="/logo-light.jpg"
              alt="ALMASONS GiNi AI POWERED PLATFORM"
              style={{ height: 44, width: 'auto', objectFit: 'contain' }}
            />
          </Link>
          <div className="eyebrow">Welcome back</div>
          <h1>Sign in to learn</h1>
          <p>Access your courses, progress and certificates.</p>
          {err && <div style={{ color: '#b42318', fontSize: 12, margin: '15px 0' }}>{err}</div>}
          <form className="form" onSubmit={submit}>
            <div className="field">
              <label>Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {loading ? (
                <>
                  <Loader2 className="spinner-icon" size={16} /> Signing in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>
          <div className="divider" />
          <div className="small">Demo student: student@example.com / Password123!</div>
          <p className="small">
            New learner? <Link href="/register" style={{ color: 'var(--orange)' }}>Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="page container">Loading sign in...</div>}>
      <LoginForm />
    </Suspense>
  );
}
