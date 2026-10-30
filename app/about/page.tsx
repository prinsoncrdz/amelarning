'use client';

import Link from 'next/link';
import { Lightbulb, Rocket, Target, ShieldCheck, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="page" style={{ paddingTop: 0 }}>
      {/* Hero Section */}
      <section className="hero" style={{ minHeight: 450 }}>
        <div className="container hero-copy">
          <div className="eyebrow">ABOUT ALMASONS GINI</div>
          <h1 style={{ fontSize: 48 }}>
            Empowering the Next Generation of <span>Tech & Industry</span> Skills
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.7 }}>
            Almasons Gini is a state-of-the-art learning management platform engineered to deliver adaptive, highly practical online courses, assessments, and accredited certifications.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <Link href="/courses" className="btn btn-primary">
              Explore Catalog
            </Link>
            <Link href="/register" className="btn btn-outline">
              Get Started
            </Link>
          </div>
        </div>
        <div className="hero-art">
          <img
            src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80"
            alt="Learning Team"
          />
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section">
        <div className="container">
          <div className="detail-grid" style={{ alignItems: 'center' }}>
            <div>
              <div className="eyebrow">OUR MISSION</div>
              <h2 style={{ fontSize: 36, letterSpacing: '-1.5px', margin: '10px 0 16px' }}>
                Bridging the Gap Between Knowledge and Application
              </h2>
              <p className="muted" style={{ fontSize: 15, lineHeight: 1.8 }}>
                Traditional learning platforms rely on passive video watching. At Almasons Gini, we believe real capability is forged through structured modules, interactive knowledge checks, unlimited retries, and instant verifiable certification.
              </p>
              <p className="muted" style={{ fontSize: 15, lineHeight: 1.8, marginTop: 12 }}>
                Whether you are an individual advancing your technical career or an enterprise upskilling hundreds of employees, our backend-driven LMS delivers seamless learning experiences.
              </p>
            </div>
            <div className="card" style={{ padding: 30, background: '#fafafa', border: '1px solid var(--line)' }}>
              <div style={{ color: '#f59e0b', marginBottom: 12 }}>
                <Lightbulb size={36} />
              </div>
              <h3 style={{ fontSize: 20, marginBottom: 10 }}>Our Vision</h3>
              <p className="muted" style={{ fontSize: 14, lineHeight: 1.7 }}>
                "To become the gold standard in intelligent skill assessment, where every learner achieves true mastery and every employer can trust verified accomplishments."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Pillars */}
      <section className="section" style={{ background: '#f8fafc', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="eyebrow">WHY ALMASONS GINI</div>
            <h2 style={{ fontSize: 34, marginTop: 6 }}>Engineered for Excellence</h2>
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            <div className="card" style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ color: '#f59e0b', marginBottom: 14, display: 'flex', justifyContent: 'center' }}>
                <Rocket size={34} />
              </div>
              <h3 style={{ fontSize: 17, marginBottom: 8 }}>Practical Curriculums</h3>
              <p className="muted" style={{ fontSize: 12, lineHeight: 1.6 }}>
                Courses designed by industry veterans with hands-on modules and real-world projects.
              </p>
            </div>

            <div className="card" style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ color: '#f59e0b', marginBottom: 14, display: 'flex', justifyContent: 'center' }}>
                <Target size={34} />
              </div>
              <h3 style={{ fontSize: 17, marginBottom: 8 }}>Adaptive Retries</h3>
              <p className="muted" style={{ fontSize: 12, lineHeight: 1.6 }}>
                Unlimited quiz retries during learning to foster mastery rather than high-stakes penalization.
              </p>
            </div>

            <div className="card" style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ color: '#f59e0b', marginBottom: 14, display: 'flex', justifyContent: 'center' }}>
                <ShieldCheck size={34} />
              </div>
              <h3 style={{ fontSize: 17, marginBottom: 8 }}>Verifiable Certificates</h3>
              <p className="muted" style={{ fontSize: 12, lineHeight: 1.6 }}>
                Tamper-proof certificates backed by unique verification IDs and instant online lookup.
              </p>
            </div>

            <div className="card" style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ color: '#f59e0b', marginBottom: 14, display: 'flex', justifyContent: 'center' }}>
                <Zap size={34} />
              </div>
              <h3 style={{ fontSize: 17, marginBottom: 8 }}>Enterprise Speed</h3>
              <p className="muted" style={{ fontSize: 12, lineHeight: 1.6 }}>
                Instant deployment for corporate teams with automated progress sync and audit analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Global Impact Stats */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 35 }}>
            <div className="eyebrow">BY THE NUMBERS</div>
            <h2 style={{ fontSize: 32, marginTop: 6 }}>Platform Reach & Achievement</h2>
          </div>

          <div className="stats" style={{ marginTop: 0 }}>
            <div className="stat" style={{ padding: 30 }}>
              <b style={{ fontSize: 32, color: 'var(--orange)' }}>50,000+</b>
              <span style={{ fontSize: 13 }}>Active Global Learners</span>
            </div>
            <div className="stat" style={{ padding: 30 }}>
              <b style={{ fontSize: 32, color: 'var(--orange)' }}>120+</b>
              <span style={{ fontSize: 13 }}>Specialized Courses</span>
            </div>
            <div className="stat" style={{ padding: 30 }}>
              <b style={{ fontSize: 32, color: 'var(--orange)' }}>98%</b>
              <span style={{ fontSize: 13 }}>User Satisfaction Rating</span>
            </div>
            <div className="stat" style={{ padding: 30 }}>
              <b style={{ fontSize: 32, color: 'var(--orange)' }}>15+</b>
              <span style={{ fontSize: 13 }}>Global Corporate Partners</span>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="card" style={{ padding: 40, background: '#111418', color: '#fff', borderRadius: 16, textAlign: 'center' }}>
            <div className="eyebrow" style={{ color: 'var(--orange)' }}>START YOUR JOURNEY TODAY</div>
            <h2 style={{ fontSize: 36, margin: '10px 0 14px', color: '#fff' }}>
              Ready to elevate your skills with Almasons Gini?
            </h2>
            <p className="muted" style={{ color: '#9da8b6', maxWidth: 600, margin: '0 auto 24px', fontSize: 15 }}>
              Join thousands of professionals already mastering future-ready skills on our platform.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
              <Link href="/courses" className="btn btn-primary" style={{ padding: '12px 24px' }}>
                Browse All Courses
              </Link>
              <Link
                href="/register"
                className="btn"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#ffffff',
                  padding: '12px 24px',
                  fontWeight: 600
                }}
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
