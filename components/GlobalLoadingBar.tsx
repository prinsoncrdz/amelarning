'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function GlobalLoadingBar() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    let activeRequests = 0;
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      activeRequests++;
      setIsLoading(true);
      setProgress(prev => (prev < 30 ? 30 : Math.min(prev + 20, 85)));

      try {
        const response = await originalFetch(...args);
        return response;
      } finally {
        activeRequests--;
        if (activeRequests <= 0) {
          activeRequests = 0;
          setProgress(100);
          setTimeout(() => {
            setIsLoading(false);
            setProgress(0);
          }, 300);
        }
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setProgress(70);
    const timer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 200);
    }, 150);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  if (!isLoading && progress === 0) return null;

  return (
    <>
      <div className="global-loading-bar-container">
        <div
          className="global-loading-bar"
          style={{
            width: `${progress}%`,
            opacity: isLoading ? 1 : 0
          }}
        />
      </div>
    </>
  );
}
