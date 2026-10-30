'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TableSkeleton } from '@/components/Skeleton';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Award, 
  DollarSign, 
  CheckCircle2, 
  HelpCircle, 
  Download, 
  FileSpreadsheet,
  ArrowUpRight,
  Activity
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDownloadCsv = (type: string) => {
    window.open(`/api/admin/analytics/export?type=${type}`, '_blank');
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 60 }}>
        <TableSkeleton rows={8} cols={5} />
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const courses = data?.coursePerformance || [];
  const recent = data?.recentEnrollments || [];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid #e2e8f0', paddingBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: '#6366f1', textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity size={14} /> SYSTEM PERFORMANCE & REVENUE INTELLIGENCE
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            LMS Analytics Dashboard
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Real-time telemetry across revenue, student course completion, quiz scores, and certificates.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => handleDownloadCsv('courses')}
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, background: '#fff', padding: '8px 16px' }}
          >
            <FileSpreadsheet size={15} color="#059669" /> Courses CSV
          </button>
          <button
            onClick={() => handleDownloadCsv('enrollments')}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, background: '#6366f1', padding: '8px 16px' }}
          >
            <Download size={15} /> Enrollments CSV
          </button>
        </div>
      </div>

      {/* KPI Stats Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 20, background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>TOTAL REVENUE</span>
            <div style={{ background: '#ecfdf5', padding: 6, borderRadius: 8, color: '#059669' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>
            ${metrics.totalRevenue?.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: '#059669', fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <TrendingUp size={13} /> {metrics.totalEnrollments} Paid & Free Enrollments
          </div>
        </div>

        <div className="card" style={{ padding: 20, background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>STUDENT ENGAGEMENT</span>
            <div style={{ background: '#eff6ff', padding: 6, borderRadius: 8, color: '#2563eb' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>
            {metrics.totalStudents} <span style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>Students</span>
          </div>
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginTop: 4 }}>
            Across {metrics.publishedCourses} Published Courses
          </div>
        </div>

        <div className="card" style={{ padding: 20, background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>AVG COMPLETION RATE</span>
            <div style={{ background: '#fef3c7', padding: 6, borderRadius: 8, color: '#d97706' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>
            {metrics.completionRate}%
          </div>
          <div style={{ fontSize: 11, color: '#d97706', fontWeight: 600, marginTop: 4 }}>
            {metrics.completedEnrollments} Student Graduation Completions
          </div>
        </div>

        <div className="card" style={{ padding: 20, background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>QUIZ PASS RATE</span>
            <div style={{ background: '#f3e8ff', padding: 6, borderRadius: 8, color: '#9333ea' }}>
              <HelpCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>
            {metrics.quizPassRate}%
          </div>
          <div style={{ fontSize: 11, color: '#9333ea', fontWeight: 600, marginTop: 4 }}>
            Avg Quiz Score: {metrics.avgQuizScore}% ({metrics.quizAttemptsCount} attempts)
          </div>
        </div>
      </div>

      {/* Main Grid: Course Performance Table & Assessment Telemetry */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 28 }}>
        {/* Course Leaderboard */}
        <div className="card" style={{ padding: 24, background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
                Course Performance & Revenue Breakdown
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                Enrolled learners, completion progress, and generated revenue per course.
              </p>
            </div>
            <Link href="/admin/courses" style={{ fontSize: 12, fontWeight: 600, color: '#6366f1', textDecoration: 'none' }}>
              Manage Courses →
            </Link>
          </div>

          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr style={{ background: '#f8fafc', textTransform: 'uppercase', fontSize: 11 }}>
                <th style={{ padding: '10px 12px' }}>Course</th>
                <th style={{ padding: '10px 12px' }}>Price</th>
                <th style={{ padding: '10px 12px' }}>Students</th>
                <th style={{ padding: '10px 12px' }}>Completion</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c: any) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{c.title}</div>
                    <span className="tag" style={{ fontSize: 10, background: c.status === 'PUBLISHED' ? '#ecfdf5' : '#f1f5f9', color: c.status === 'PUBLISHED' ? '#047857' : '#64748b' }}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: 13, fontWeight: 600, color: c.price > 0 ? '#0f172a' : '#059669' }}>
                    {c.price > 0 ? `$${c.price}` : 'FREE'}
                  </td>
                  <td style={{ padding: '12px', fontSize: 13, fontWeight: 600 }}>
                    {c.enrollmentsCount} learners
                  </td>
                  <td style={{ padding: '12px', width: 140 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${c.completionRate}%`, background: c.completionRate > 50 ? '#10b981' : '#f59e0b', borderRadius: 99 }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>{c.completionRate}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800, fontSize: 14, color: '#0f172a' }}>
                    ${c.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Side: Certificates & Telemetry Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Certificate Issuance Card */}
          <div className="card" style={{ padding: 24, background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: '#fff', borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ background: 'rgba(255,255,255,0.15)', padding: 8, borderRadius: 8 }}>
                <Award size={22} color="#fbbf24" />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase' }}>ACCREDITED CERTIFICATION</div>
                <h4 style={{ margin: 0, fontSize: 16, color: '#fff' }}>Verified Diplomas</h4>
              </div>
            </div>

            <div style={{ fontSize: 36, fontWeight: 900, color: '#fbbf24', margin: '8px 0 4px' }}>
              {metrics.certificatesCount}
            </div>
            <p style={{ fontSize: 12, color: '#c7d2fe', lineHeight: 1.5, margin: 0 }}>
              Official certificates issued to students upon 100% course curriculum completion & passing assessment threshold.
            </p>
          </div>

          {/* Assessment Performance Box */}
          <div className="card" style={{ padding: 24, background: '#fff' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
              <BarChart3 size={16} color="#6366f1" /> Quiz Telemetry Summary
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Total Attempts</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{metrics.quizAttemptsCount}</div>
              </div>
              <div style={{ padding: 12, background: '#ecfdf5', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#047857', fontWeight: 600 }}>Passed Quizzes</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#047857' }}>{metrics.quizPassCount}</div>
              </div>
            </div>

            <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
              • Average Quiz Score: <strong>{metrics.avgQuizScore}%</strong><br />
              • Overall Quiz Pass Rate: <strong>{metrics.quizPassRate}%</strong><br />
              • Retries Enabled: <strong>Unlimited Student Retries</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Live Student Enrollment Feed */}
      <div className="card" style={{ padding: 24, background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
              Live Student Activity Feed
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
              Most recent course enrollments and progress updates across all registered learners.
            </p>
          </div>
          <Link href="/admin/students" className="btn btn-outline" style={{ fontSize: 12, padding: '6px 14px' }}>
            View All Students →
          </Link>
        </div>

        <table className="table" style={{ width: '100%' }}>
          <thead>
            <tr style={{ background: '#f8fafc', textTransform: 'uppercase', fontSize: 11 }}>
              <th style={{ padding: '10px 12px' }}>Student</th>
              <th style={{ padding: '10px 12px' }}>Enrolled Course</th>
              <th style={{ padding: '10px 12px' }}>Progress</th>
              <th style={{ padding: '10px 12px' }}>Status</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Enrolled Date</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((e: any) => (
              <tr key={e.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{e.studentName}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{e.studentEmail}</div>
                </td>
                <td style={{ padding: '12px', fontSize: 13, fontWeight: 600, color: '#334155' }}>
                  {e.courseTitle}
                </td>
                <td style={{ padding: '12px', width: 150 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${e.progressPercentage}%`, background: '#6366f1', borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>{e.progressPercentage}%</span>
                  </div>
                </td>
                <td style={{ padding: '12px' }}>
                  <span className="tag" style={{
                    fontSize: 10,
                    background: e.status === 'COMPLETED' ? '#ecfdf5' : e.status === 'IN_PROGRESS' ? '#eff6ff' : '#f8fafc',
                    color: e.status === 'COMPLETED' ? '#047857' : e.status === 'IN_PROGRESS' ? '#1d4ed8' : '#64748b'
                  }}>
                    {e.status}
                  </span>
                </td>
                <td style={{ padding: '12px', textAlign: 'right', fontSize: 12, color: '#64748b' }}>
                  {new Date(e.startedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
