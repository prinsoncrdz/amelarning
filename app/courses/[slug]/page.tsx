'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { CourseDetailSkeleton } from '@/components/Skeleton';
import { BookOpen, CreditCard, ArrowLeft, ArrowRight, PlayCircle, ShieldCheck } from 'lucide-react';

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [data, setData] = useState<any>();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch('/api/courses/' + slug)
      .then(async r => {
        if (!r.ok) {
          const errData = await r.json().catch(() => ({}));
          setError(errData.error || 'Course not found');
          return;
        }
        const jsonData = await r.json();
        setData(jsonData);
      })
      .catch(() => setError('Failed to load course details'));

    // Dynamically load Razorpay Checkout SDK Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [slug]);

  if (error) {
    return (
      <main className="page container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ color: '#94a3b8', marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
          <BookOpen size={44} />
        </div>
        <h2 style={{ fontSize: 24, marginBottom: 8, color: 'var(--ink)' }}>Course Not Found</h2>
        <p className="muted" style={{ marginBottom: 24, fontSize: 14 }}>
          {error}
        </p>
        <Link href="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={16} /> Back to All Courses
        </Link>
      </main>
    );
  }

  if (!data) return <CourseDetailSkeleton />;
  const c = data.course;
  if (!c) {
    return (
      <main className="page container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 24, marginBottom: 8 }}>Course Not Found</h2>
        <Link href="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={16} /> Back to All Courses
        </Link>
      </main>
    );
  }
  const isEnrolled = !!c.enrollment;

  async function handleEnrollOrPay() {
    if (isEnrolled) {
      router.push('/learn/' + c.id);
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create Razorpay Order or auto-enroll if free
      const res = await fetch('/api/payments/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: c.id })
      });

      if (res.status === 401) {
        setIsProcessing(false);
        router.push('/login?next=/courses/' + slug);
        return;
      }

      const orderData = await res.json();

      if (!res.ok) {
        alert(orderData.error || 'Could not initiate purchase');
        setIsProcessing(false);
        return;
      }

      // If course is free or user is already enrolled
      if (orderData.isFree) {
        setIsProcessing(false);
        router.push('/learn/' + c.id);
        return;
      }

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'AlphaLearn LMS',
        description: `Enrollment for ${orderData.courseTitle}`,
        image: c.thumbnail,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/payments/razorpay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId: c.id
            })
          });

          setIsProcessing(false);
          if (verifyRes.ok) {
            router.push('/learn/' + c.id);
          } else {
            alert('Payment verification failed.');
          }
        },
        prefill: {
          name: orderData.user?.name || '',
          email: orderData.user?.email || ''
        },
        theme: {
          color: '#ff6a00'
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      if ((window as any).Razorpay) {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Fallback for POC testing if SDK popup is blocked
        const verifyRes = await fetch('/api/payments/razorpay/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: orderData.orderId,
            razorpay_payment_id: 'pay_poc_' + Date.now(),
            razorpay_signature: 'sig_poc_test',
            courseId: c.id
          })
        });
        setIsProcessing(false);
        if (verifyRes.ok) {
          router.push('/learn/' + c.id);
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setIsProcessing(false);
    }
  }

  return (
    <main className="page">
      <div className="container">
        <div className="breadcrumbs">
          Courses / {c.category?.name || 'General'} / {c.title}
        </div>
        <div className="detail-grid">
          <div>
            <div className="banner">
              <img src={c.bannerImage || c.thumbnail} alt="" />
            </div>
            <h1 className="detail-title">{c.title}</h1>
            <p className="muted">{c.shortDescription}</p>
            <p style={{ lineHeight: 1.8 }}>{c.description}</p>

            <h2 style={{ marginTop: 35 }}>What you'll learn</h2>
            <ul style={{ lineHeight: 2, color: '#475467' }}>
              <li>Understand the fundamentals and practical workflows</li>
              <li>Apply concepts to real-world scenarios</li>
              <li>Complete hands-on lessons and assessments</li>
              <li>Earn a verifiable certificate</li>
            </ul>

            <h2 style={{ marginTop: 35 }}>Course curriculum</h2>
            <div className="curriculum">
              {c.modules?.map((m: any) => (
                <div className="module" key={m.id}>
                  <div className="module-head">
                    <b>Module {m.order}: {m.title}</b>
                    <span>{m.lessons?.length || 0} lessons</span>
                  </div>
                  {m.lessons?.map((l: any) => (
                    <div className="lesson-row" key={l.id}>
                      <PlayCircle size={14} style={{ color: '#6366f1', flexShrink: 0 }} />
                      {l.title}
                      <span className="pill">{l.type}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <aside>
            <div className="sidebar-card">
              <div className="price">${c.price}</div>
              <p className="muted">
                {c.level} · {Math.round((c.durationMinutes || 0) / 60)} hours
              </p>
              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: 14, display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}
                disabled={isProcessing}
                onClick={handleEnrollOrPay}
              >
                {isProcessing
                  ? 'Processing Order...'
                  : isEnrolled
                    ? 'Continue Learning →'
                    : Number(c.price) === 0
                      ? 'Enroll Now (Free)'
                      : `Buy Now with Razorpay ($${c.price})`}
              </button>
              <div className="divider" />
              <p className="small" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                <CreditCard size={16} color="#6366f1" /> <strong>Razorpay Secure Payments</strong>
              </p>
              <p className="small muted" style={{ fontSize: 11, marginTop: 4 }}>
                Supports Cards, UPI, Netbanking & Wallets
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
