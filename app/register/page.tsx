'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const [f, setF] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: any) {
    e.preventDefault();
    setLoading(true);
    setErr('');

    try {
      const r = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(f)
      });
      const x = await r.json();
      if (!r.ok) {
        setErr(x.error);
        setLoading(false);
        return;
      }
      window.dispatchEvent(new Event('auth-change'));
      router.refresh();
      router.push('/dashboard');
    } catch {
      setErr('Failed to create account. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="login-shell">
      <div className="login-art">
        <img src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80" alt="Learning" />
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
          <div className="eyebrow">Start learning</div>
          <h1>Create your account</h1>
          <p>Join the learning platform and start building tomorrow.</p>
          {err && <div style={{ color: '#b42318', fontSize: 12, margin: '10px 0' }}>{err}</div>}
          <form className="form" onSubmit={submit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="field">
                <label>First name</label>
                <input required value={f.firstName} onChange={e => setF({ ...f, firstName: e.target.value })} />
              </div>
              <div className="field">
                <label>Last name</label>
                <input required value={f.lastName} onChange={e => setF({ ...f, lastName: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label>Email</label>
              <input required type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
            </div>
            <div className="field">
              <label>Password</label>
              <input required type="password" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {loading ? (
                <>
                  <Loader2 className="spinner-icon" size={16} /> Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
          <p className="small" style={{ marginTop: 16 }}>
            Already have an account? <Link href="/login" style={{ color: 'var(--orange)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
