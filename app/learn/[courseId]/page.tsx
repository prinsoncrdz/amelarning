'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Lock, PlayCircle, FileText, Image as ImageIcon, ChevronLeft, ChevronRight, ShieldCheck, Loader2 } from 'lucide-react';
import { VideoPlayer } from '@/components/VideoPlayer';
import { LearnPageSkeleton } from '@/components/Skeleton';

export default function Learn() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const [data, setData] = useState<any>();
  const [active, setActive] = useState(0);
  const [quiz, setQuiz] = useState<any>();
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<any>();
  const [attemptsCount, setAttemptsCount] = useState<number>(0);
  const [actionLoading, setActionLoading] = useState(false);

  const load = () =>
    fetch('/api/learning/' + courseId)
      .then(async r => {
        if (r.status === 401) {
          router.push('/login');
          return null;
        }
        return r.json();
      })
      .then(setData);

  useEffect(() => {
    load();
  }, [courseId]);

  const lessons = useMemo(
    () =>
      data?.modules.flatMap((m: any) =>
        m.lessons.map((l: any) => ({ ...l, moduleTitle: m.title, moduleLocked: m.locked }))
      ) || [],
    [data]
  );
  const totalCount = lessons.length + (data?.finalExam ? 1 : 0);
  const isFinal = data?.finalExam && active === lessons.length;
  const current = isFinal
    ? {
        id: data.finalExam.id,
        title: data.finalExam.title,
        type: 'FINAL_EXAM',
        moduleTitle: 'Final Assessment',
        locked: data.finalExam.locked,
        content: { quizId: data.finalExam.id }
      }
    : lessons[active];

  useEffect(() => {
    setQuiz(undefined);
    setAnswers({});
    setResult(undefined);
    setAttemptsCount(0);
    if (current?.type === 'QUIZ' || current?.type === 'FINAL_EXAM')
      fetch('/api/quizzes/' + current.content.quizId)
        .then(r => r.json())
        .then(x => {
          setQuiz(x.quiz);
          setAttemptsCount(x.attemptsCount || 0);
          if (x.latestAttempt) {
            setResult(x.latestAttempt);
            const prefilled: Record<string, string[]> = {};
            (x.latestAttempt.answers || []).forEach((a: any) => {
              prefilled[a.questionId] = a.selectedOptionIds || [];
            });
            setAnswers(prefilled);
          }
        });
  }, [current?.id, current?.type]);

  if (data?.error === 'NOT_ENROLLED') {
    return (
      <main className="page container" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: 560, margin: '40px auto' }}>
        <div style={{ width: 64, height: 64, borderRadius: 99, background: '#fff3eb', color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Lock size={32} />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
          Enrollment Required
        </h2>
        <p className="muted" style={{ fontSize: 14, margin: '0 0 24px', lineHeight: 1.5 }}>
          You are not enrolled in <strong>{data.courseTitle || 'this course'}</strong>. You must enroll in this course before accessing the learning path.
        </p>
        <Link href={data.courseSlug ? `/courses/${data.courseSlug}` : '/courses'} className="btn btn-primary" style={{ padding: '12px 24px', fontSize: 14 }}>
          Go to Course Page & Enroll →
        </Link>
      </main>
    );
  }

  if (!data || !current) return <LearnPageSkeleton />;

  async function refresh() {
    const r = await fetch('/api/learning/' + courseId);
    setData(await r.json());
  }

  async function complete(pct = 100, lastPosition = 0) {
    setActionLoading(true);
    try {
      await fetch('/api/learning/lessons/' + current.id + '/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complete: true, progressPercentage: pct, lastPosition })
      });
      await refresh();
    } finally {
      setActionLoading(false);
    }
  }

  async function submitQuiz() {
    setActionLoading(true);
    try {
      const r = await fetch('/api/quizzes/' + current.content.quizId + '/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, selectedOptionIds]) => ({
            questionId,
            selectedOptionIds
          }))
        })
      });
      const x = await r.json();
      if (x.error) {
        alert(x.error);
        return;
      }
      setResult(x);
      setAttemptsCount(c => c + 1);
      await refresh();
    } finally {
      setActionLoading(false);
    }
  }

  const lessonIcon = (type: string, done: boolean, locked: boolean) =>
    done ? (
      <CheckCircle size={15} />
    ) : locked ? (
      <Lock size={15} />
    ) : type === 'VIDEO' ? (
      <PlayCircle size={15} />
    ) : type === 'IMAGE' ? (
      <ImageIcon size={15} />
    ) : (
      <FileText size={15} />
    );

  const nextLocked = active < lessons.length - 1 ? lessons[active + 1]?.locked : active === lessons.length - 1 ? data?.finalExam?.locked : false;
  const isNextDisabled = active >= totalCount - 1 || (nextLocked && current.status !== 'COMPLETED' && !result?.passed);

  return (
    <div className="learn-layout">
      <aside className="learn-side">
        <h3>{data.course.title}</h3>
        <div className="lesson-nav">
          {data.modules.map((m: any) => (
            <div key={m.id}>
              <div className="module-label">
                Module {m.order} · {m.progress}%
              </div>
              {m.lessons.map((l: any) => {
                const i = lessons.findIndex((x: any) => x.id === l.id);
                return (
                  <button
                    key={l.id}
                    className={'lesson-link ' + (i === active ? 'active ' : '') + (l.locked ? 'locked' : '')}
                    onClick={() => !l.locked && setActive(i)}
                  >
                    {lessonIcon(l.type, l.status === 'COMPLETED', l.locked)}
                    <span>{l.title}</span>
                  </button>
                );
              })}
            </div>
          ))}
          {data.finalExam && (
            <button
              className={'lesson-link ' + (isFinal ? 'active ' : '') + (data.finalExam.locked ? 'locked' : '')}
              onClick={() => !data.finalExam.locked && setActive(lessons.length)}
            >
              <ShieldCheck size={15} />
              <span>{data.finalExam.title}</span>
            </button>
          )}
        </div>
      </aside>
      <main className="learn-main">
        <div className="learn-top">
          <div>
            <b>{current.moduleTitle}</b>
            <div className="small">{data.course.title}</div>
          </div>
          <div style={{ width: 180 }}>
            <div className="small" style={{ marginBottom: 5 }}>
              {data.progress.percentage}% complete
            </div>
            <div className="progressbar">
              <span style={{ width: data.progress.percentage + '%' }} />
            </div>
          </div>
        </div>
        <div className="lesson-content">
          <div className="eyebrow">{current.type === 'FINAL_EXAM' ? 'FINAL ASSESSMENT' : current.type + ' LESSON'}</div>
          <h1>{current.title}</h1>
          {current.type === 'VIDEO' && (
            <div className="video-box" style={{ margin: '20px 0' }}>
              <VideoPlayer
                src={current.content.videoUrl}
                onTimeUpdate={(cur, dur) => {
                  if (dur && cur / dur >= 0.8) complete(Math.round((cur / dur) * 100), cur);
                }}
              />
            </div>
          )}
          {(current.type === 'TEXT' || current.type === 'RICH_TEXT') && (
            <div className="richtext" dangerouslySetInnerHTML={{ __html: current.content.html || '<p>No content yet.</p>' }} />
          )}
          {current.type === 'IMAGE' && <img className="media-img" src={current.content.imageUrl} alt={current.content.caption || current.title} />}
          {current.type === 'PDF' && (
            <div className="card" style={{ padding: 25 }}>
              <p>PDF lesson</p>
              <a className="btn btn-primary" href={current.content.pdfUrl} target="_blank">
                Open PDF
              </a>
            </div>
          )}
          {(current.type === 'QUIZ' || current.type === 'FINAL_EXAM') && (
            <div className="quiz">
              {quiz ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                    {quiz.description && <p className="muted" style={{ margin: 0 }}>{quiz.description}</p>}
                    <span className="tag" style={{ background: '#f2f4f7', color: '#344054' }}>
                      Attempts: {attemptsCount}
                    </span>
                  </div>
                  {quiz.questions.map((q: any, i: number) => (
                    <div key={q.id} style={{ margin: '25px 0' }}>
                      <b>
                        {i + 1}. {q.question}
                      </b>
                      {q.options.map((o: any) => (
                        <label className="option" key={o.id}>
                          <input
                            type={q.type === 'MULTIPLE_CHOICE' ? 'checkbox' : 'radio'}
                            name={q.id}
                            checked={(answers[q.id] || []).includes(o.id)}
                            onChange={() =>
                              setAnswers(a => ({
                                ...a,
                                [q.id]: q.type === 'MULTIPLE_CHOICE' ? ((a[q.id] || []).includes(o.id) ? a[q.id].filter(v => v !== o.id) : [...(a[q.id] || []), o.id]) : [o.id]
                              }))
                            }
                          />
                          <span>{o.text}</span>
                        </label>
                      ))}
                    </div>
                  ))}
                  <button className="btn btn-primary" disabled={actionLoading} onClick={submitQuiz} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    {actionLoading ? (
                      <>
                        <Loader2 size={16} className="spinner-icon" /> Submitting...
                      </>
                    ) : (
                      `Submit ${current.type === 'FINAL_EXAM' ? 'Exam' : 'Quiz'}`
                    )}
                  </button>
                  {result && (
                    <div className="result">
                      <div className="result-score" style={{ color: result.passed ? 'var(--green)' : '#d92d20' }}>
                        {result.percentage}%
                      </div>
                      <p>
                        <b>{result.passed ? 'Passed' : 'Not passed'}</b> · Passing score {result.passingScore || quiz?.passingScore || 70}%
                      </p>
                      <p style={{ fontSize: 13, marginTop: 8, color: result.passed ? '#19a36b' : '#d92d20' }}>
                        {result.passed
                          ? isFinal || current.type === 'FINAL_EXAM'
                            ? 'Congratulations! You passed the final assessment and completed the course!'
                            : 'Congratulations! You passed this assessment and unlocked the next module.'
                          : `You scored ${result.percentage}%. Please score at least ${result.passingScore || quiz?.passingScore || 70}% to pass.`}
                      </p>
                      {!result.passed && (
                        <button
                          className="btn btn-outline"
                          style={{ marginTop: 12 }}
                          onClick={() => {
                            setResult(undefined);
                            setAnswers({});
                          }}
                        >
                          Retake Quiz (Attempt #{attemptsCount + 1})
                        </button>
                      )}
                      {result.courseCompleted && <div className="toast">Congratulations! Course completed and certificate generated.</div>}
                      {result.passed && (isFinal || current.type === 'FINAL_EXAM' || data.progress.completed) ? (
                        <div style={{ marginTop: 15, display: 'flex', gap: 10, justifyContent: 'center' }}>
                          <Link href="/certificates" className="btn btn-primary">
                            View Certificate
                          </Link>
                          <Link href="/dashboard" className="btn btn-outline">
                            Back to Dashboard
                          </Link>
                        </div>
                      ) : (
                        result.passed &&
                        active < totalCount - 1 && (
                          <button className="btn btn-primary" style={{ marginTop: 15 }} onClick={() => setActive(active + 1)}>
                            Continue to Next Lesson <ChevronRight size={16} />
                          </button>
                        )
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p>Loading assessment...</p>
              )}
            </div>
          )}
          {current.type !== 'VIDEO' && current.type !== 'QUIZ' && current.type !== 'FINAL_EXAM' && (
            <button className="btn btn-primary" disabled={actionLoading} style={{ marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 8 }} onClick={() => complete()}>
              {actionLoading ? (
                <>
                  <Loader2 size={16} className="spinner-icon" /> Saving Progress...
                </>
              ) : (
                'Mark lesson complete'
              )}
            </button>
          )}
          <div className="learn-actions">
            <button className="btn btn-outline" disabled={active === 0} onClick={() => setActive(active - 1)}>
              <ChevronLeft size={16} /> Previous
            </button>
            <button className="btn btn-primary" disabled={isNextDisabled} onClick={() => setActive(active + 1)}>
              Next <ChevronRight size={16} />
            </button>
          </div>
          {data.progress.completed && <div className="toast">Course completed. Your certificate is available in your dashboard.</div>}
        </div>
      </main>
    </div>
  );
}
