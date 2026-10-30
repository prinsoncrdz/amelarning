export const dynamic = 'force-dynamic';
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, ShieldCheck, Loader2, Award, Calendar, User, ArrowLeft } from 'lucide-react';

export default function Verify() {
  const { number } = useParams<{ number: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!number) return;
    setLoading(true);
    fetch('/api/certificates/verify/' + encodeURIComponent(number))
      .then(r => r.json())
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(() => {
        setData({ valid: false });
        setLoading(false);
      });
  }, [number]);

  return (
    <main className="page" style={{ background: '#f8fafc', padding: '60px 0 100px', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: 720 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div className="eyebrow" style={{ color: '#6366f1', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <ShieldCheck size={16} /> OFFICIAL ACCREDITATION & CERTIFICATE REGISTRY
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.8px' }}>
            Certificate Verification System
          </h1>
        </div>

        <div className="card" style={{ padding: 40, background: '#ffffff', borderRadius: 16, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          {loading ? (
            <div style={{ padding: '36px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, color: '#6366f1' }}>
                <Loader2 size={48} className="spinner-icon" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                Verifying Certificate Credential...
              </h3>
              <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
                Querying serial number <strong>{number}</strong> against the official registry...
              </p>
            </div>
          ) : data?.valid && data?.certificate ? (
            <>
              <div style={{ color: '#10b981', marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                <CheckCircle2 size={56} />
              </div>
              <div style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, display: 'inline-block', marginBottom: 16 }}>
                ✓ OFFICIAL & VERIFIED CREDENTIAL
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px', color: '#0f172a' }}>
                Certificate Authenticated
              </h2>
              <p style={{ color: '#64748b', fontSize: 15, marginBottom: 28 }}>
                This certificate has been verified as authentic and validly issued by <strong>Almasons GiNi</strong>.
              </p>

              <div style={{ background: '#f8fafc', borderRadius: 12, padding: 24, textAlign: 'left', border: '1px solid #e2e8f0', display: 'grid', gap: 16, marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <User size={20} style={{ color: '#6366f1', flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Student Name</span>
                    <strong style={{ fontSize: 16, color: '#0f172a' }}>{data.certificate.studentName}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Award size={20} style={{ color: '#6366f1', flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Completed Course</span>
                    <strong style={{ fontSize: 16, color: '#0f172a' }}>{data.certificate.courseTitle}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Calendar size={20} style={{ color: '#6366f1', flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Completion Date & Serial</span>
                    <span style={{ fontSize: 14, color: '#334155', fontWeight: 600 }}>
                      {new Date(data.certificate.completionDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    <span style={{ fontSize: 12, color: '#64748b', display: 'block', marginTop: 2 }}>
                      Serial: {data.certificate.certificateNumber}
                    </span>
                  </div>
                </div>
              </div>

              <Link href="/courses" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                <ArrowLeft size={16} /> Explore Platform Courses
              </Link>
            </>
          ) : (
            <>
              <div style={{ color: '#ef4444', marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                <AlertCircle size={56} />
              </div>
              <div style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, display: 'inline-block', marginBottom: 16 }}>
                ✕ UNVERIFIED / INVALID SERIAL NUMBER
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px', color: '#0f172a' }}>
                Certificate Not Found
              </h2>
              <p style={{ color: '#64748b', fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
                The certificate serial number <strong>"{number}"</strong> could not be verified in our official registry. Please check the serial number and try again.
              </p>
              <Link href="/courses" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                <ArrowLeft size={16} /> Back to Courses
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
