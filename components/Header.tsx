'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { GraduationCap } from 'lucide-react';

export function Header() {
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = () => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(x => setUser(x.user))
      .catch(() => setUser(null));
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener('auth-change', checkAuth);
    return () => window.removeEventListener('auth-change', checkAuth);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/courses');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.dispatchEvent(new Event('auth-change'));
    router.push('/');
    router.refresh();
  };

  return (
    <header className="header">
      <div className="container nav" style={{ gap: 20 }}>
        <Link href="/" className="logo" style={{ display: 'inline-flex', alignItems: 'center' }}>
          <img
            src="/logo-light.jpg"
            alt="ALMASONS GiNi AI POWERED PLATFORM"
            style={{ height: 40, width: 'auto', objectFit: 'contain' }}
          />
        </Link>

        <nav className="navlinks" style={{ gap: 20 }}>
          <Link href="/courses">Courses</Link>
          <Link href="/about">About</Link>
        </nav>

        {/* Embedded Header Search Box */}
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 360, margin: '0 10px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 14px 8px 36px',
              borderRadius: 20,
              border: '1px solid var(--line)',
              background: '#f8fafc',
              fontSize: 13,
              outline: 'none'
            }}
          />
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#98a2b3"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </form>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {user ? (
            <>
              <Link className="btn btn-outline" href="/dashboard">Dashboard</Link>
              {user.role !== 'STUDENT' && <Link className="btn btn-primary" href="/admin">Admin</Link>}
              <button className="btn btn-outline" onClick={handleLogout} style={{ borderColor: '#eaecf0', color: '#667085' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-outline" href="/login">Login</Link>
              <Link className="btn btn-primary" href="/register">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
