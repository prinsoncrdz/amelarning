'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { GlobalLoadingBar } from '@/components/GlobalLoadingBar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdminRoute = pathname?.startsWith('/admin');

  useEffect(() => {
    // If logged in as ADMIN or INSTRUCTOR and trying to visit public pages, redirect immediately to /admin
    if (!isAdminRoute && pathname !== '/login' && pathname !== '/register') {
      fetch('/api/auth/me')
        .then(r => (r.ok ? r.json() : null))
        .then(data => {
          if (data?.user && (data.user.role === 'ADMIN' || data.user.role === 'INSTRUCTOR')) {
            router.push('/admin');
          }
        })
        .catch(() => {});
    }
  }, [pathname, isAdminRoute, router]);

  if (isAdminRoute) {
    return (
      <>
        <Suspense fallback={null}>
          <GlobalLoadingBar />
        </Suspense>
        {children}
      </>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <GlobalLoadingBar />
      </Suspense>
      <Header />
      {children}
      <footer className="footer">
        <div className="container row">
          <span>ALMASONS GINI · AI FOCUSED PLATFORM</span>
          <span>© 2026 Learning Platform</span>
        </div>
      </footer>
    </>
  );
}
