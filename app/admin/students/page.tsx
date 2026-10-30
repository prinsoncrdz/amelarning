export const dynamic = 'force-dynamic';
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TableSkeleton } from '@/components/Skeleton';
import { GraduationCap, Eye, BookOpen, HelpCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [modalTab, setModalTab] = useState<'COURSES' | 'CERTIFICATES' | 'QUIZZES'>('COURSES');

  const loadStudents = () => {
    setLoading(true);
    fetch('/api/admin/students')
      .then(r => r.json())
      .then(data => {
        setStudents(data.students || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = students.filter(s => {
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
  });

  const totalEnrollments = students.reduce((sum, s) => sum + s.totalEnrollments, 0);
  const totalCompleted = students.reduce((sum, s) => sum + s.completedCoursesCount, 0);
  const totalCertificates = students.reduce((sum, s) => sum + s.certificatesCount, 0);

  function openStudentDetails(student: any) {
    setSelectedStudent(student);
    setModalTab('COURSES');
  }

  return (
    <div>
      {/* Page Header */}
      <div className="section-head">
        <div>
          <div className="eyebrow">STUDENT ANALYTICS</div>
          <h1 style={{ fontSize: 28, letterSpacing: '-1px', margin: '4px 0 0' }}>
            Student Profiles & Enrollments
          </h1>
        </div>
        <Link href="/admin" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
      </div>

      {/* Numerical Analytics Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <div className="card" style={{ padding: 20 }}>
          <div className="muted" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.5px' }}>TOTAL REGISTERED STUDENTS</div>
          <b style={{ fontSize: 24, display: 'block', margin: '6px 0 2px', color: 'var(--ink)' }}>
            {students.length}
          </b>
          <span className="small muted" style={{ fontSize: 12 }}>Registered student accounts</span>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div className="muted" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.5px' }}>COURSE ENROLLMENTS</div>
          <b style={{ fontSize: 24, display: 'block', margin: '6px 0 2px', color: 'var(--orange)' }}>
            {totalEnrollments}
          </b>
          <span className="small muted" style={{ fontSize: 12 }}>Total course subscriptions</span>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div className="muted" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.5px' }}>COMPLETED COURSES</div>
          <b style={{ fontSize: 24, display: 'block', margin: '6px 0 2px', color: '#027a48' }}>
            {totalCompleted}
          </b>
          <span className="small muted" style={{ fontSize: 12 }}>Courses completed at 100%</span>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div className="muted" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.5px' }}>CERTIFICATES ISSUED</div>
          <b style={{ fontSize: 24, color: 'var(--green)', display: 'block', margin: '6px 0 2px' }}>
            {totalCertificates}
          </b>
          <span className="small muted" style={{ fontSize: 12 }}>Verified completion badges</span>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="card" style={{ padding: 18, marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search students by name or email address..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ flex: 1, border: '1px solid var(--line)', borderRadius: 8, padding: '10px 14px', outline: 'none', fontSize: 14 }}
        />
        <span className="small muted" style={{ fontSize: 13 }}>
          Showing <strong>{filteredStudents.length}</strong> of {students.length} Students
        </span>
      </div>

      {/* Students Data Table */}
      <div className="card" style={{ padding: 24 }}>
        {loading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : filteredStudents.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', background: '#fafafa', borderRadius: 10, border: '1px dashed var(--line)' }}>
            <p className="muted" style={{ margin: 0, fontSize: 15 }}>
              No students found matching your search.
            </p>
          </div>
        ) : (
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                <th style={{ padding: 14 }}>Student Name & Email</th>
                <th style={{ padding: 14 }}>Total Enrolled</th>
                <th style={{ padding: 14 }}>Active / In Progress</th>
                <th style={{ padding: 14 }}>Completed</th>
                <th style={{ padding: 14 }}>Certificates</th>
                <th style={{ padding: 14 }}>Joined Date</th>
                <th style={{ padding: 14, textAlign: 'right', whiteSpace: 'nowrap' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(s => (
                <tr key={s.id}>
                  <td style={{ padding: 14 }}>
                    <b style={{ fontSize: 14, color: 'var(--ink)' }}>{s.name}</b>
                    <div className="small muted" style={{ fontSize: 12 }}>{s.email}</div>
                  </td>
                  <td style={{ padding: 14 }}>
                    <span className="tag" style={{ background: '#f2f4f7', color: '#344054', fontWeight: 600 }}>
                      {s.totalEnrollments} Courses
                    </span>
                  </td>
                  <td style={{ padding: 14 }}>
                    <span className="tag" style={{ background: '#fff3eb', color: 'var(--orange)', fontWeight: 600 }}>
                      {s.activeCoursesCount} Active
                    </span>
                  </td>
                  <td style={{ padding: 14 }}>
                    <span className="tag" style={{ background: '#ecfdf3', color: '#027a48', fontWeight: 600 }}>
                      {s.completedCoursesCount} Done
                    </span>
                  </td>
                  <td style={{ padding: 14 }}>
                    <strong style={{ fontSize: 13, color: '#19a36b', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <GraduationCap size={15} color="#10b981" /> {s.certificatesCount}
                    </strong>
                  </td>
                  <td style={{ padding: 14, fontSize: 13, color: '#475467' }}>
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: 14, textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '6px 14px', fontSize: 12, borderRadius: 8, borderColor: '#d0d5dd', color: '#344054', background: '#fff', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      onClick={() => openStudentDetails(s)}
                    >
                      <Eye size={14} /> View Student Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ======================================================== */}
      {/* STUDENT DETAILS POPUP MODAL DIALOG */}
      {/* ======================================================== */}
      {selectedStudent && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: 20
          }}
        >
          <div
            className="card"
            style={{
              width: 800,
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 28,
              background: '#fff',
              borderRadius: 14,
              boxShadow: '0 25px 60px rgba(0,0,0,0.35)'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, borderBottom: '1px solid #eaecf0', paddingBottom: 16 }}>
              <div>
                <span className="eyebrow">STUDENT PROFILE & ENROLLMENT ANALYTICS</span>
                <h2 style={{ margin: '4px 0 0', fontSize: 22, color: 'var(--ink)' }}>
                  {selectedStudent.name}
                </h2>
                <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>
                  {selectedStudent.email} • Account Status:{' '}
                  <span className="tag" style={{ fontSize: 10, padding: '2px 6px', background: '#ecfdf3', color: '#027a48' }}>
                    {selectedStudent.status}
                  </span>
                </p>
              </div>
              <button
                style={{ border: 0, background: 'transparent', fontSize: 24, cursor: 'pointer', color: '#667085' }}
                onClick={() => setSelectedStudent(null)}
              >
                ✕
              </button>
            </div>

            {/* Student Overview Stat Summary Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24, background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475467' }}>PURCHASED / ENROLLED</div>
                <b style={{ fontSize: 18, color: 'var(--ink)' }}>{selectedStudent.totalEnrollments} Courses</b>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475467' }}>IN PROGRESS</div>
                <b style={{ fontSize: 18, color: 'var(--orange)' }}>{selectedStudent.activeCoursesCount} Courses</b>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475467' }}>COMPLETED</div>
                <b style={{ fontSize: 18, color: '#027a48' }}>{selectedStudent.completedCoursesCount} Courses</b>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475467' }}>CERTIFICATES</div>
                <b style={{ fontSize: 18, color: '#19a36b', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <GraduationCap size={16} color="#10b981" /> {selectedStudent.certificatesCount} Issued
                </b>
              </div>
            </div>

            {/* Modal Content Navigation Tabs */}
            <div style={{ display: 'flex', gap: 8, borderBottom: '2px solid #eaecf0', paddingBottom: 10, marginBottom: 20 }}>
              <button
                onClick={() => setModalTab('COURSES')}
                style={{
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: modalTab === 'COURSES' ? 700 : 500,
                  borderRadius: 8,
                  border: modalTab === 'COURSES' ? '1px solid var(--orange)' : '1px solid #d0d5dd',
                  background: modalTab === 'COURSES' ? 'var(--orange)' : '#fff',
                  color: modalTab === 'COURSES' ? '#fff' : '#344054',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <BookOpen size={15} /> Enrolled Courses ({selectedStudent.enrollments.length})
              </button>
              <button
                onClick={() => setModalTab('CERTIFICATES')}
                style={{
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: modalTab === 'CERTIFICATES' ? 700 : 500,
                  borderRadius: 8,
                  border: modalTab === 'CERTIFICATES' ? '1px solid var(--orange)' : '1px solid #d0d5dd',
                  background: modalTab === 'CERTIFICATES' ? 'var(--orange)' : '#fff',
                  color: modalTab === 'CERTIFICATES' ? '#fff' : '#344054',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <GraduationCap size={15} /> Certificates ({selectedStudent.certificates.length})
              </button>
              <button
                onClick={() => setModalTab('QUIZZES')}
                style={{
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: modalTab === 'QUIZZES' ? 700 : 500,
                  borderRadius: 8,
                  border: modalTab === 'QUIZZES' ? '1px solid var(--orange)' : '1px solid #d0d5dd',
                  background: modalTab === 'QUIZZES' ? 'var(--orange)' : '#fff',
                  color: modalTab === 'QUIZZES' ? '#fff' : '#344054',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <HelpCircle size={15} /> Quiz Attempts ({selectedStudent.quizAttempts.length})
              </button>
            </div>

            {/* TAB 1: Enrolled Courses List */}
            {modalTab === 'COURSES' && (
              <div style={{ display: 'grid', gap: 12 }}>
                {selectedStudent.enrollments.length === 0 ? (
                  <p className="muted" style={{ textAlign: 'center', padding: 20 }}>No courses enrolled yet.</p>
                ) : (
                  selectedStudent.enrollments.map((e: any) => (
                    <div
                      key={e.id}
                      style={{
                        padding: 16,
                        borderRadius: 10,
                        border: '1px solid #eaecf0',
                        background: '#fff',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 16
                      }}
                    >
                      <div style={{ display: 'flex', gap: 14, alignItems: 'center', flex: 1 }}>
                        <img
                          src={e.course?.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=300&q=80'}
                          alt=""
                          style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }}
                        />
                        <div>
                          <b style={{ fontSize: 15, color: 'var(--ink)' }}>{e.course?.title}</b>
                          <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                            <span
                              className="tag"
                              style={{
                                fontSize: 10,
                                background: e.status === 'COMPLETED' ? '#ecfdf3' : e.status === 'IN_PROGRESS' ? '#fff3eb' : '#f2f4f7',
                                color: e.status === 'COMPLETED' ? '#027a48' : e.status === 'IN_PROGRESS' ? 'var(--orange)' : '#344054'
                              }}
                            >
                              {e.status}
                            </span>
                            <span className="small muted" style={{ fontSize: 11 }}>
                              Enrolled: {new Date(e.startedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Course Completion Progress Bar */}
                      <div style={{ width: 180 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span className="muted">Progress</span>
                          <strong>{e.progressPercentage}%</strong>
                        </div>
                        <div style={{ height: 6, background: '#eaecf0', borderRadius: 99, overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${e.progressPercentage}%`,
                              background: e.progressPercentage === 100 ? '#19a36b' : 'var(--orange)',
                              borderRadius: 99
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 2: Certificates List */}
            {modalTab === 'CERTIFICATES' && (
              <div style={{ display: 'grid', gap: 12 }}>
                {selectedStudent.certificates.length === 0 ? (
                  <p className="muted" style={{ textAlign: 'center', padding: 20 }}>No certificates earned yet.</p>
                ) : (
                  selectedStudent.certificates.map((cert: any) => (
                    <div
                      key={cert.id}
                      style={{
                        padding: 16,
                        borderRadius: 10,
                        border: '1px solid #abefc6',
                        background: '#ecfdf3',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#027a48' }}>
                          OFFICIAL CERTIFICATE OF COMPLETION
                        </span>
                        <h4 style={{ margin: '4px 0 0', fontSize: 16, color: '#067647' }}>
                          {cert.courseTitle}
                        </h4>
                        <div style={{ fontSize: 12, color: '#027a48', marginTop: 4 }}>
                          Code: <strong>{cert.verificationCode}</strong> • Issued: {new Date(cert.completionDate).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="tag" style={{ background: '#fff', color: '#027a48', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={13} color="#027a48" /> Verified
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: Quiz Assessment Attempts */}
            {modalTab === 'QUIZZES' && (
              <div style={{ display: 'grid', gap: 10 }}>
                {selectedStudent.quizAttempts.length === 0 ? (
                  <p className="muted" style={{ textAlign: 'center', padding: 20 }}>No quiz attempts recorded yet.</p>
                ) : (
                  selectedStudent.quizAttempts.map((attempt: any) => (
                    <div
                      key={attempt.id}
                      style={{
                        padding: 14,
                        borderRadius: 8,
                        border: '1px solid #eaecf0',
                        background: '#fff',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <b style={{ fontSize: 14, color: 'var(--ink)' }}>{attempt.quiz?.title || 'Module Assessment'}</b>
                        <div style={{ fontSize: 12, color: '#667085', marginTop: 2 }}>
                          Attempt #{attempt.attemptNumber} • Date: {new Date(attempt.completedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span
                          className="tag"
                          style={{
                            background: attempt.passed ? '#ecfdf3' : '#fee4e2',
                            color: attempt.passed ? '#027a48' : '#d92d20',
                            fontWeight: 700
                          }}
                        >
                          {attempt.passed ? 'PASSED' : 'FAILED'} ({attempt.percentage}%)
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, paddingTop: 16, borderTop: '1px solid #eaecf0' }}>
              <button className="btn btn-outline" onClick={() => setSelectedStudent(null)}>
                Close Student Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
