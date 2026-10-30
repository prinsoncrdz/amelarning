'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Award, Download, CheckCircle2 } from 'lucide-react';

export default function Certificate() {
  const { id } = useParams<{ id: string }>();
  const [c, setC] = useState<any>();

  useEffect(() => {
    fetch('/api/certificates')
      .then(r => r.json())
      .then(x => setC((x.certificates || []).find((v: any) => v.id === id)));
  }, [id]);

  if (!c) return <main className="page container" style={{ padding: '60px 20px', textAlign: 'center' }}>Loading certificate...</main>;

  return (
    <main className="page">
      <div className="container">
        <div className="certificate">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <img
              src="/logo-light.jpg"
              alt="ALMASONS GiNi AI POWERED PLATFORM"
              style={{ height: 44, width: 'auto', objectFit: 'contain' }}
            />
          </div>
          <h1>Certificate of Completion</h1>
          <p>This is to certify that</p>
          <div className="name">{c.studentName}</div>
          <p>has successfully completed the course</p>
          <div className="course">{c.courseTitle}</div>
          <p>Completed on {new Date(c.completionDate).toLocaleDateString()}</p>
          <p className="small">Certificate ID: {c.certificateNumber}</p>
          <p className="small">Instructor: {c.instructorName}</p>
          <div style={{ marginTop: 25 }}>
            <a className="btn btn-primary" href={`/api/certificates/${c.id}/download`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Download size={16} /> Download PDF
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
