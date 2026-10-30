'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardSkeleton } from '@/components/Skeleton';
import { BookOpen, Award, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(data => {
        setDashData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !dashData || !dashData.user) {
    return <DashboardSkeleton />;
  }

  const user = dashData.user;
  const enrollments = dashData.enrollments || [];
  const certs = dashData.certificates || [];
  const totalCourses = dashData.coursesCount || enrollments.length;

  return (
    <main className="page">
      <div className="container">
        <div className="eyebrow">Student dashboard</div>
        <h1 style={{ fontSize: 36, letterSpacing: -1.5 }}>Welcome back, {user.firstName}</h1>
        <div className="dashboard-grid" style={{ margin: '25px 0 40px' }}>
          <div className="dash-stat">
            <b>{enrollments.length}</b>
            <div className="muted">Enrolled Courses</div>
          </div>
          <div className="dash-stat">
            <b>{enrollments.filter((e: any) => e.status === 'COMPLETED').length}</b>
            <div className="muted">Completed</div>
          </div>
          <div className="dash-stat">
            <b>{enrollments.filter((e: any) => e.status !== 'COMPLETED').length}</b>
            <div className="muted">In progress</div>
          </div>
          <div className="dash-stat">
            <b>{certs.length}</b>
            <div className="muted">Certificates</div>
          </div>
        </div>

        <div className="section-head">
          <div>
            <h2>Continue Learning</h2>
            <p className="muted">Pick up where you left off.</p>
          </div>
        </div>

        {enrollments.length === 0 ? (
          <div className="card" style={{ padding: '40px 20px', textAlign: 'center', margin: '20px 0' }}>
            <div style={{ color: '#94a3b8', marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
              <BookOpen size={44} />
            </div>
            <h3 style={{ fontSize: 20, marginBottom: 8, color: 'var(--ink)' }}>No Enrolled Courses Yet</h3>
            <p className="muted" style={{ maxWidth: 460, margin: '0 auto 20px', fontSize: 14, lineHeight: 1.6 }}>
              You have not enrolled in any courses yet. Explore our course catalog to choose a course and start learning!
            </p>
            <Link className="btn btn-primary" href="/courses" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Explore Available Courses <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid">
            {enrollments.slice(0, 6).map((e: any) => {
              const isDone = e.status === 'COMPLETED';
              return (
                <div className="card" key={e.id}>
                  <img className="course-img" src={e.course?.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'} alt="" />
                  <div className="card-body">
                    <span className="tag" style={{ background: isDone ? '#ecfdf5' : '#fff3eb', color: isDone ? '#047857' : 'var(--orange)' }}>
                      {isDone ? 'COMPLETED' : 'IN PROGRESS'}
                    </span>
                    <h3>{e.course?.title}</h3>
                    <div className="progressbar">
                      <span style={{ width: e.progressPercentage + '%' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' }}>
                      <span className="small">{e.progressPercentage}% complete</span>
                      <Link className="btn btn-primary" href={'/learn/' + e.course?.id}>
                        {isDone ? 'Review' : 'Continue'}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {certs.length > 0 && (
          <div style={{ marginTop: 45 }}>
            <div className="section-head">
              <div>
                <h2>My Certificates</h2>
                <p className="muted">Your earned credentials and achievements.</p>
              </div>
            </div>
            <div className="grid">
              {certs.map((crt: any) => (
                <div key={crt.id} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <span className="tag" style={{ background: '#ecfdf3', color: '#027a48', width: 'fit-content' }}>
                    VERIFIED CREDENTIAL
                  </span>
                  <h3 style={{ margin: '10px 0 4px' }}>{crt.courseTitle}</h3>
                  <p className="small muted">
                    Issued on {new Date(crt.completionDate).toLocaleDateString()} · ID: {crt.certificateNumber}
                  </p>
                  <div style={{ marginTop: 15, display: 'flex', gap: 8 }}>
                    <Link className="btn btn-primary" style={{ flex: 1, fontSize: 12, padding: '8px 12px' }} href={'/certificates/' + crt.id}>
                      View Certificate
                    </Link>
                    <Link className="btn btn-outline" style={{ fontSize: 12, padding: '8px 12px' }} href={'/verify-certificate/' + crt.certificateNumber}>
                      Verify
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
