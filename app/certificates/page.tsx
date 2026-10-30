'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, GraduationCap, ArrowRight } from 'lucide-react';

export default function Certificates() {
  const [certs, setCerts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/certificates')
      .then(r => r.json())
      .then(x => setCerts(x.certificates || []));
  }, []);

  return (
    <main className="page">
      <div className="container">
        <div className="eyebrow">Achievements</div>
        <h1 style={{ fontSize: 36, letterSpacing: -1.5 }}>My Certificates</h1>
        <div className="grid" style={{ marginTop: 25 }}>
          {certs.map(c => (
            <div className="card" key={c.id}>
              <div style={{ padding: 24 }}>
                <span className="tag" style={{ background: '#ecfdf3', color: '#027a48', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                  <Award size={14} /> CERTIFICATE OF COMPLETION
                </span>
                <h3 style={{ margin: '14px 0 6px', fontSize: 18 }}>{c.courseTitle}</h3>
                <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
                  Issued on {new Date(c.completionDate).toLocaleDateString()}
                </p>
                <Link className="btn btn-primary" href={'/certificates/' + c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <GraduationCap size={16} /> View Certificate
                </Link>
              </div>
            </div>
          ))}
        </div>
        {!certs.length && (
          <div className="card" style={{ padding: 40, textAlign: 'center', marginTop: 20 }}>
            <Award size={44} color="#94a3b8" style={{ marginBottom: 12 }} />
            <h3 style={{ fontSize: 18, margin: '0 0 8px' }}>No Certificates Earned Yet</h3>
            <p className="muted" style={{ margin: '0 0 20px', fontSize: 14 }}>
              Complete a course to receive your official verifiable certificate.
            </p>
            <Link href="/courses" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Explore Courses <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
