'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, BookOpen, Users, BarChart3 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => {
        if (!r.ok) {
          router.push('/login');
          return null;
        }
        return r.json();
      })
      .then(data => {
        if (data) {
          if (data.user.role === 'STUDENT') {
            alert('Access Denied: You need Administrator or Instructor permissions to access the Admin Console.');
            router.push('/dashboard');
            return;
          }
          setUser(data.user);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        router.push('/login');
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111418', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="eyebrow" style={{ color: 'var(--orange)', marginBottom: 8 }}>ALMASONS GINI</div>
          <h2>Loading Admin Console...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#111418', overflow: 'hidden' }}>
      {/* Enterprise Admin Top Bar */}
      <header
        style={{
          height: 60,
          background: '#111418',
          color: '#fff',
          borderBottom: '1px solid #22272e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          flexShrink: 0,
          zIndex: 40
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <Link href="/admin" className="logo" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <img
              src="/logo-dark.png"
              alt="ALMASONS GiNi AI POWERED PLATFORM Admin"
              style={{ height: 38, width: 'auto', objectFit: 'contain' }}
            />
          </Link>
          <span className="tag" style={{ background: '#22272e', color: '#a0aec0', fontSize: 10 }}>
            Admin Console
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user && (
            <div style={{ fontSize: 12, color: '#a0aec0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>Logged in as <strong style={{ color: '#fff' }}>{user.firstName} {user.lastName}</strong></span>
              <span className="tag" style={{ background: 'var(--orange)', color: '#fff', fontSize: 10 }}>
                {user.role}
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(229, 62, 62, 0.15)',
              color: '#fc8181',
              border: '1px solid #742a2a',
              borderRadius: 7,
              padding: '7px 14px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Admin Independent Dual Scroll Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', flex: 1, height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
        {/* Left Navigation Sidebar (Independent Scroll) */}
        <aside
          style={{
            background: '#17191c',
            color: '#b8bec7',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRight: '1px solid #22272e',
            height: '100%',
            overflowY: 'auto'
          }}
        >
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14, paddingLeft: 8 }}>
              Management Console
            </div>

            <nav style={{ display: 'grid', gap: 6 }}>
              <Link
                href="/admin"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  background: pathname === '/admin' ? '#24282e' : 'transparent',
                  color: pathname === '/admin' ? '#fff' : '#b8bec7',
                  transition: 'all 0.15s',
                  textDecoration: 'none'
                }}
              >
                <LayoutDashboard size={16} /> Dashboard
              </Link>

              <Link
                href="/admin/courses"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  background: pathname?.startsWith('/admin/courses') ? '#24282e' : 'transparent',
                  color: pathname?.startsWith('/admin/courses') ? '#fff' : '#b8bec7',
                  transition: 'all 0.15s',
                  textDecoration: 'none'
                }}
              >
                <BookOpen size={16} /> Courses Management
              </Link>

              <Link
                href="/admin/students"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  background: pathname === '/admin/students' ? '#24282e' : 'transparent',
                  color: pathname === '/admin/students' ? '#fff' : '#b8bec7',
                  transition: 'all 0.15s',
                  textDecoration: 'none'
                }}
              >
                <Users size={16} /> Student Directory
              </Link>

              <Link
                href="/admin/analytics"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  background: pathname === '/admin/analytics' ? '#24282e' : 'transparent',
                  color: pathname === '/admin/analytics' ? '#fff' : '#b8bec7',
                  transition: 'all 0.15s',
                  textDecoration: 'none'
                }}
              >
                <BarChart3 size={16} /> Analytics & CSV Reports
              </Link>
            </nav>
          </div>

          <div style={{ padding: '16px 12px', background: '#111418', borderRadius: 8, border: '1px solid #22272e', fontSize: 11, marginTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green)', fontWeight: 700 }}>
              <span style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--green)' }} />
              System Online
            </div>
            <div style={{ color: '#64748b', marginTop: 4 }}>
              Prisma LMS Engine Active
            </div>
          </div>
        </aside>

        {/* Right Main Workspace (Independent Scroll) */}
        <main style={{ padding: '32px 40px', background: '#fff', height: '100%', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
