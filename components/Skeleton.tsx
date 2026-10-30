'use client';

import React from 'react';

export function SkeletonBox({
  width = '100%',
  height = '16px',
  borderRadius = '6px',
  style = {}
}: {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="skeleton-box"
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
    />
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="skeleton-card">
      <SkeletonBox height="165px" borderRadius="0" />
      <div style={{ padding: 16 }}>
        <SkeletonBox width="30%" height="20px" borderRadius="12px" style={{ marginBottom: 12 }} />
        <SkeletonBox width="85%" height="22px" style={{ marginBottom: 10 }} />
        <SkeletonBox width="100%" height="14px" style={{ marginBottom: 6 }} />
        <SkeletonBox width="60%" height="14px" style={{ marginBottom: 16 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <SkeletonBox width="40%" height="14px" />
          <SkeletonBox width="25%" height="24px" borderRadius="6px" />
        </div>
      </div>
    </div>
  );
}

export function CourseGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid">
      {Array.from({ length: count }).map((_, idx) => (
        <CourseCardSkeleton key={idx} />
      ))}
    </div>
  );
}

export function CourseDetailSkeleton() {
  return (
    <div className="page container">
      <SkeletonBox width="30%" height="14px" style={{ marginBottom: 20 }} />
      <div className="detail-grid">
        <div>
          <SkeletonBox height="340px" borderRadius="14px" style={{ marginBottom: 24 }} />
          <SkeletonBox width="80%" height="38px" style={{ marginBottom: 14 }} />
          <SkeletonBox width="100%" height="16px" style={{ marginBottom: 8 }} />
          <SkeletonBox width="90%" height="16px" style={{ marginBottom: 24 }} />
          <div style={{ padding: 24, background: '#fafafa', borderRadius: 12, border: '1px solid #eaecf0', marginBottom: 24 }}>
            <SkeletonBox width="40%" height="22px" style={{ marginBottom: 16 }} />
            <SkeletonBox width="100%" height="14px" style={{ marginBottom: 8 }} />
            <SkeletonBox width="95%" height="14px" style={{ marginBottom: 8 }} />
            <SkeletonBox width="70%" height="14px" />
          </div>
        </div>
        <div>
          <div className="sidebar-card">
            <SkeletonBox width="40%" height="32px" style={{ marginBottom: 16 }} />
            <SkeletonBox width="100%" height="44px" borderRadius="8px" style={{ marginBottom: 16 }} />
            <SkeletonBox width="100%" height="14px" style={{ marginBottom: 8 }} />
            <SkeletonBox width="80%" height="14px" style={{ marginBottom: 8 }} />
            <SkeletonBox width="90%" height="14px" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div style={{ width: '100%', background: '#fff', borderRadius: 12, border: '1px solid #eaecf0', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #eaecf0', display: 'flex', gap: 20 }}>
        {Array.from({ length: cols }).map((_, cIdx) => (
          <SkeletonBox key={cIdx} width={`${100 / cols}%`} height="14px" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: 20, alignItems: 'center' }}>
          {Array.from({ length: cols }).map((_, cIdx) => (
            <SkeletonBox key={cIdx} width={`${100 / cols}%`} height="16px" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="page container">
      <div style={{ marginBottom: 24 }}>
        <SkeletonBox width="40%" height="32px" style={{ marginBottom: 8 }} />
        <SkeletonBox width="60%" height="16px" />
      </div>

      <div className="dashboard-grid" style={{ marginBottom: 32 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="dash-stat">
            <SkeletonBox width="50%" height="14px" style={{ marginBottom: 10 }} />
            <SkeletonBox width="30%" height="32px" />
          </div>
        ))}
      </div>

      <SkeletonBox width="30%" height="24px" style={{ marginBottom: 16 }} />
      <CourseGridSkeleton count={3} />
    </div>
  );
}

export function LearnPageSkeleton() {
  return (
    <div className="learn-layout">
      <aside className="learn-side" style={{ padding: 16 }}>
        <SkeletonBox width="70%" height="20px" style={{ marginBottom: 20 }} />
        {Array.from({ length: 3 }).map((_, mIdx) => (
          <div key={mIdx} style={{ marginBottom: 20 }}>
            <SkeletonBox width="50%" height="12px" style={{ marginBottom: 10 }} />
            <SkeletonBox width="100%" height="36px" borderRadius="8px" style={{ marginBottom: 6 }} />
            <SkeletonBox width="100%" height="36px" borderRadius="8px" />
          </div>
        ))}
      </aside>
      <main className="learn-main">
        <div className="learn-top" style={{ padding: '18px 30px' }}>
          <div>
            <SkeletonBox width="150px" height="18px" style={{ marginBottom: 6 }} />
            <SkeletonBox width="220px" height="12px" />
          </div>
          <SkeletonBox width="180px" height="24px" borderRadius="12px" />
        </div>
        <div className="lesson-content" style={{ padding: 30 }}>
          <SkeletonBox width="120px" height="12px" style={{ marginBottom: 12 }} />
          <SkeletonBox width="70%" height="32px" style={{ marginBottom: 24 }} />
          <SkeletonBox width="100%" height="420px" borderRadius="12px" style={{ marginBottom: 24 }} />
          <SkeletonBox width="100%" height="16px" style={{ marginBottom: 10 }} />
          <SkeletonBox width="95%" height="16px" style={{ marginBottom: 10 }} />
          <SkeletonBox width="80%" height="16px" />
        </div>
      </main>
    </div>
  );
}
