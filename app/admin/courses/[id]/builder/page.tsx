'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FileUpload } from '@/components/FileUpload';
import { RichTextEditor } from '@/components/RichTextEditor';
import { 
  GraduationCap, 
  Edit3, 
  Trash2, 
  HelpCircle, 
  Settings, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Plus 
} from 'lucide-react';

export default function CourseBuilder() {
  const { id } = useParams<{ id: string }>();
  const [c, setC] = useState<any>();
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

  // Custom Alert & Confirm Modal States
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'info' | 'success' | 'error' | 'warning' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { }
  });

  function triggerAlert(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info', title?: string) {
    setAlertModal({
      isOpen: true,
      title: title || (type === 'error' ? 'Action Failed' : type === 'success' ? 'Success' : 'Notice'),
      message,
      type
    });
  }

  function triggerConfirm(title: string, message: string, onConfirm: () => void, danger: boolean = true, confirmText = 'Delete', cancelText = 'Cancel') {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      danger,
      onConfirm
    });
  }

  // Modal Visibility States
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [moduleTitleInput, setModuleTitleInput] = useState('');

  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editingLessonQuizId, setEditingLessonQuizId] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState({ moduleId: '', title: '', type: 'TEXT', order: '1' });
  const [mediaUrl, setMediaUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const [quizPassingScore, setQuizPassingScore] = useState('70');
  const [quizTimeLimit, setQuizTimeLimit] = useState('10');

  // Question Management Modal States
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [activeQuizLesson, setActiveQuizLesson] = useState<any>(null);
  const [quizSettingsForm, setQuizSettingsForm] = useState({ passingScore: '70', timeLimitMinutes: '10' });
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    type: 'SINGLE_CHOICE',
    points: 10,
    options: [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false }
    ]
  });
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);

  // Final Assessment Form State
  const [finalExamForm, setFinalExamForm] = useState({
    enabled: false,
    passingScore: '70',
    maxAttempts: ''
  });
  const [isSavingFinalExam, setIsSavingFinalExam] = useState(false);

  const loadCourse = () => {
    fetch('/api/admin/courses')
      .then(r => r.json())
      .then(x => {
        const found = (x.courses || []).find((v: any) => v.id === id);
        setC(found);

        if (found) {
          setFinalExamForm({
            enabled: Boolean(found.finalExamEnabled),
            passingScore: String(found.finalPassingScore ?? 70),
            maxAttempts: found.maxExamAttempts ? String(found.maxExamAttempts) : ''
          });
        }

        if (found?.modules?.length > 0) {
          setActiveModuleId(prev => {
            if (prev === 'FINAL_EXAM') return 'FINAL_EXAM';
            const exists = found.modules.some((m: any) => m.id === prev);
            return exists ? prev : found.modules[0].id;
          });
        } else {
          setActiveModuleId(prev => (prev === 'FINAL_EXAM' ? 'FINAL_EXAM' : null));
        }

        // Keep active quiz lesson or final exam updated if questions modal is open
        if (activeQuizLesson) {
          if (activeQuizLesson.isFinal || activeQuizLesson.id === found?.finalExam?.id) {
            if (found?.finalExam) {
              setActiveQuizLesson({
                id: found.finalExam.id,
                title: `Final Assessment: ${found.title}`,
                quiz: found.finalExam,
                isFinal: true
              });
              setQuizSettingsForm({
                passingScore: String(found.finalExam.passingScore ?? 70),
                timeLimitMinutes: String(found.finalExam.timeLimitMinutes ?? 30)
              });
            }
          } else {
            for (const m of found?.modules || []) {
              const foundLesson = m.lessons?.find((l: any) => l.id === activeQuizLesson.id);
              if (foundLesson) {
                setActiveQuizLesson(foundLesson);
                if (foundLesson.quiz) {
                  setQuizSettingsForm({
                    passingScore: String(foundLesson.quiz.passingScore ?? 70),
                    timeLimitMinutes: String(foundLesson.quiz.timeLimitMinutes ?? 10)
                  });
                }
                break;
              }
            }
          }
        }
      });
  };

  async function handleSaveFinalExam(overrideEnabled?: boolean) {
    setIsSavingFinalExam(true);
    const enabled = overrideEnabled !== undefined ? overrideEnabled : finalExamForm.enabled;
    const r = await fetch('/api/admin/courses/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        finalExamEnabled: enabled,
        finalPassingScore: Number(finalExamForm.passingScore) || 70,
        maxExamAttempts: finalExamForm.maxAttempts ? Number(finalExamForm.maxAttempts) : null
      })
    });
    setIsSavingFinalExam(false);
    if (r.ok) {
      triggerAlert('Final Assessment settings saved successfully!', 'success');
      loadCourse();
    } else {
      triggerAlert('Could not update Final Assessment settings.', 'error');
    }
  }

  useEffect(() => {
    loadCourse();
  }, [id]);

  // MODULE MODAL HANDLERS
  function openAddModuleModal() {
    setEditingModuleId(null);
    setModuleTitleInput('');
    setShowModuleModal(true);
  }

  function openEditModuleModal(m: any) {
    setEditingModuleId(m.id);
    setModuleTitleInput(m.title);
    setShowModuleModal(true);
  }

  async function handleSaveModule() {
    if (!moduleTitleInput.trim()) {
      triggerAlert('Please enter a module title.', 'warning');
      return;
    }

    if (editingModuleId) {
      const r = await fetch('/api/admin/modules/' + editingModuleId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: moduleTitleInput })
      });
      if (r.ok) {
        setShowModuleModal(false);
        loadCourse();
      } else {
        triggerAlert('Could not update module.', 'error');
      }
    } else {
      const order = (c?.modules?.length || 0) + 1;
      const r = await fetch('/api/admin/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: id, title: moduleTitleInput, order })
      });
      if (r.ok) {
        const data = await r.json();
        if (data.module?.id) {
          setActiveModuleId(data.module.id);
        }
        setShowModuleModal(false);
        loadCourse();
      } else {
        triggerAlert('Could not add module.', 'error');
      }
    }
  }

  function handleDeleteModule(moduleId: string) {
    triggerConfirm(
      'Delete Module',
      'Are you sure you want to delete this module and all its lessons? This action cannot be undone.',
      async () => {
        const r = await fetch('/api/admin/modules/' + moduleId, { method: 'DELETE' });
        if (r.ok) {
          loadCourse();
        } else {
          triggerAlert('Could not delete module.', 'error');
        }
      }
    );
  }

  // LESSON MODAL HANDLERS
  function openAddLessonModal(targetModuleId?: string) {
    setEditingLessonId(null);
    setEditingLessonQuizId(null);
    setMediaUrl('');
    setTextContent('');
    setQuizPassingScore('70');
    setQuizTimeLimit('10');
    const defaultModId = targetModuleId || activeModuleId || (c?.modules?.[0]?.id || '');
    const mod = c?.modules?.find((m: any) => m.id === defaultModId);
    const nextOrder = (mod?.lessons?.length || 0) + 1;
    setLessonForm({
      moduleId: defaultModId,
      title: '',
      type: 'TEXT',
      order: String(nextOrder)
    });
    setShowLessonModal(true);
  }

  function openEditLessonModal(l: any, targetModuleId: string) {
    setEditingLessonId(l.id);
    setEditingLessonQuizId(l.quiz?.id || null);
    const existingUrl = l.content?.videoUrl || l.content?.imageUrl || l.content?.pdfUrl || '';
    const rawHtml = l.content?.html || '';
    setMediaUrl(existingUrl);
    setTextContent(rawHtml.replace(/<p>|<\/p>|<br\/>/g, '\n').trim());
    setQuizPassingScore(String(l.quiz?.passingScore ?? 70));
    setQuizTimeLimit(String(l.quiz?.timeLimitMinutes ?? 10));
    setLessonForm({
      moduleId: targetModuleId,
      title: l.title,
      type: l.type,
      order: String(l.order || 1)
    });
    setShowLessonModal(true);
  }

  async function handleSaveLesson() {
    if (!lessonForm.moduleId) {
      triggerAlert('Please select a Target Module.', 'warning');
      return;
    }
    if (!lessonForm.title.trim()) {
      triggerAlert('Please enter a Lesson Title.', 'warning');
      return;
    }

    const contentPayload =
      lessonForm.type === 'TEXT' || lessonForm.type === 'RICH_TEXT'
        ? { html: textContent ? `<p>${textContent.replace(/\n/g, '<br/>')}</p>` : '<h2>Lesson Content</h2><p>Course lesson text body.</p>' }
        : lessonForm.type === 'VIDEO'
          ? { videoUrl: mediaUrl || 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' }
          : lessonForm.type === 'IMAGE'
            ? { imageUrl: mediaUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80' }
            : lessonForm.type === 'PDF'
              ? { pdfUrl: mediaUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
              : {};

    if (editingLessonId) {
      const r = await fetch('/api/admin/lessons/' + editingLessonId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: lessonForm.title,
          type: lessonForm.type,
          order: Number(lessonForm.order),
          content: contentPayload
        })
      });

      if (lessonForm.type === 'QUIZ' && editingLessonQuizId) {
        await fetch('/api/admin/quizzes/' + editingLessonQuizId, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            passingScore: Number(quizPassingScore),
            timeLimitMinutes: Number(quizTimeLimit)
          })
        });
      }

      if (r.ok) {
        setShowLessonModal(false);
        loadCourse();
      } else {
        triggerAlert('Could not update lesson.', 'error');
      }
    } else {
      const r = await fetch('/api/admin/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...lessonForm,
          order: Number(lessonForm.order),
          content: contentPayload,
          passingScore: Number(quizPassingScore),
          timeLimitMinutes: Number(quizTimeLimit)
        })
      });
      if (r.ok) {
        setShowLessonModal(false);
        loadCourse();
      } else {
        triggerAlert('Could not add lesson.', 'error');
      }
    }
  }

  function handleDeleteLesson(lessonId: string) {
    triggerConfirm(
      'Delete Lesson',
      'Are you sure you want to delete this lesson? This action cannot be undone.',
      async () => {
        const r = await fetch('/api/admin/lessons/' + lessonId, { method: 'DELETE' });
        if (r.ok) {
          loadCourse();
        } else {
          triggerAlert('Could not delete lesson.', 'error');
        }
      }
    );
  }

  // QUESTION MANAGEMENT MODAL HANDLERS
  function openQuestionsModal(item: any) {
    if (item.questions) {
      // Direct quiz object (e.g. finalExam)
      setActiveQuizLesson({
        id: item.id,
        title: `Final Assessment: ${c?.title || 'Exam'}`,
        quiz: item,
        isFinal: true
      });
      setQuizSettingsForm({
        passingScore: String(item.passingScore ?? 70),
        timeLimitMinutes: String(item.timeLimitMinutes ?? 30)
      });
    } else {
      // Lesson item containing a quiz property
      setActiveQuizLesson(item);
      if (item.quiz) {
        setQuizSettingsForm({
          passingScore: String(item.quiz.passingScore ?? 70),
          timeLimitMinutes: String(item.quiz.timeLimitMinutes ?? 10)
        });
      }
    }
    setNewQuestion({
      question: '',
      type: 'SINGLE_CHOICE',
      points: 10,
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false }
      ]
    });
    setShowQuestionModal(true);
  }

  async function handleSaveQuizSettings() {
    if (!activeQuizLesson?.quiz?.id) return;
    const r = await fetch('/api/admin/quizzes/' + activeQuizLesson.quiz.id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        passingScore: Number(quizSettingsForm.passingScore),
        timeLimitMinutes: Number(quizSettingsForm.timeLimitMinutes)
      })
    });
    if (r.ok) {
      triggerAlert('Quiz settings updated successfully!', 'success');
      loadCourse();
    } else {
      triggerAlert('Failed to update quiz settings.', 'error');
    }
  }

  function handleAddOptionField() {
    setNewQuestion(prev => ({
      ...prev,
      options: [...prev.options, { text: '', isCorrect: false }]
    }));
  }

  function handleRemoveOptionField(idx: number) {
    if (newQuestion.options.length <= 2) {
      triggerAlert('A question must have at least 2 options.', 'warning');
      return;
    }
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== idx)
    }));
  }

  function handleOptionTextChange(idx: number, text: string) {
    setNewQuestion(prev => {
      const opts = [...prev.options];
      opts[idx].text = text;
      return { ...prev, options: opts };
    });
  }

  function handleOptionCorrectChange(idx: number, isCorrect: boolean) {
    setNewQuestion(prev => {
      const opts = prev.options.map((o, i) => {
        if (prev.type === 'SINGLE_CHOICE' || prev.type === 'TRUE_FALSE') {
          return { ...o, isCorrect: i === idx ? isCorrect : false };
        }
        return i === idx ? { ...o, isCorrect } : o;
      });
      return { ...prev, options: opts };
    });
  }

  function handleTypeChange(type: string) {
    if (type === 'TRUE_FALSE') {
      setNewQuestion(prev => ({
        ...prev,
        type,
        options: [
          { text: 'True', isCorrect: true },
          { text: 'False', isCorrect: false }
        ]
      }));
    } else {
      setNewQuestion(prev => ({
        ...prev,
        type,
        options: [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false }
        ]
      }));
    }
  }

  async function handleAddQuestionSubmit() {
    if (!activeQuizLesson?.quiz?.id) return;
    if (!newQuestion.question.trim()) {
      triggerAlert('Please enter a question prompt.', 'warning');
      return;
    }
    const emptyOpts = newQuestion.options.filter(o => !o.text.trim());
    if (emptyOpts.length > 0) {
      triggerAlert('Please fill out text for all options.', 'warning');
      return;
    }
    const hasCorrect = newQuestion.options.some(o => o.isCorrect);
    if (!hasCorrect) {
      triggerAlert('Please select at least one correct option.', 'warning');
      return;
    }

    setIsSubmittingQuestion(true);
    const r = await fetch(`/api/admin/quizzes/${activeQuizLesson.quiz.id}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: newQuestion.question,
        type: newQuestion.type,
        points: Number(newQuestion.points),
        options: newQuestion.options
      })
    });
    setIsSubmittingQuestion(false);

    if (r.ok) {
      setNewQuestion({
        question: '',
        type: 'SINGLE_CHOICE',
        points: 10,
        options: [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false }
        ]
      });
      loadCourse();
    } else {
      triggerAlert('Failed to add question.', 'error');
    }
  }

  function handleDeleteQuestion(questionId: string) {
    const quizId = activeQuizLesson?.quiz?.id || c?.finalExam?.id;
    if (!quizId) return;
    triggerConfirm(
      'Delete Question',
      'Are you sure you want to delete this question? This action cannot be undone.',
      async () => {
        const r = await fetch(`/api/admin/quizzes/${quizId}/questions?questionId=${questionId}`, {
          method: 'DELETE'
        });
        if (r.ok) {
          loadCourse();
        } else {
          triggerAlert('Failed to delete question.', 'error');
        }
      }
    );
  }

  async function publishCourse() {
    const r = await fetch('/api/admin/courses/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'PUBLISHED' })
    });
    if (r.ok) {
      triggerAlert('Course published successfully!', 'success');
      loadCourse();
    } else {
      triggerAlert('Could not publish course.', 'error');
    }
  }

  const currentActiveModule = c?.modules?.find((m: any) => m.id === (activeModuleId || c?.modules?.[0]?.id));

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Top Header Bar */}
      <div className="section-head">
        <div>
          <div className="eyebrow">COURSE CURRICULUM BUILDER</div>
          <h1 style={{ fontSize: 32, letterSpacing: '-1.5px', margin: '4px 0 0' }}>
            {c?.title || 'Loading Course...'}
          </h1>
          <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>
            Status:{' '}
            <span
              className="tag"
              style={{
                background: c?.status === 'PUBLISHED' ? '#ecfdf3' : '#f2f4f7',
                color: c?.status === 'PUBLISHED' ? '#027a48' : '#344054'
              }}
            >
              {c?.status || 'DRAFT'}
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/admin/courses" className="btn btn-outline">
            ← Back to Courses
          </Link>
          {c?.status !== 'PUBLISHED' && (
            <button className="btn btn-primary" onClick={publishCourse}>
              Publish Course
            </button>
          )}
        </div>
      </div>

      {/* Main Full-Width Curriculum Workspace */}
      <div className="card" style={{ padding: 28, margin: '24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20 }}>Curriculum Structure</h2>
            <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>
              Organize modules and lessons for your students.
            </p>
          </div>
          <button className="btn btn-primary" onClick={openAddModuleModal}>
            + Add Module
          </button>
        </div>

        {c?.modules?.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', background: '#f8fafc', borderRadius: 12, border: '1px dashed var(--line)' }}>
            <p className="muted" style={{ margin: '0 0 16px', fontSize: 15 }}>
              No modules added yet. Click <strong>"+ Add Module"</strong> to start building your course.
            </p>
            <button className="btn btn-primary" onClick={openAddModuleModal}>
              + Add First Module
            </button>
          </div>
        )}

        {/* Module Horizontal Tab Bar */}
        {c?.modules?.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: 8,
              borderBottom: '2px solid #eaecf0',
              paddingBottom: 12,
              marginBottom: 24,
              overflowX: 'auto',
              alignItems: 'center'
            }}
          >
            {c?.modules?.map((m: any) => {
              const isActive = m.id === (activeModuleId || c?.modules?.[0]?.id);
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveModuleId(m.id)}
                  style={{
                    padding: '8px 16px',
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 500,
                    borderRadius: 8,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: isActive ? '1px solid var(--orange)' : '1px solid #d0d5dd',
                    background: isActive ? 'var(--orange)' : '#fff',
                    color: isActive ? '#fff' : '#344054',
                    boxShadow: isActive ? '0 2px 8px rgba(255, 106, 0, 0.25)' : 'none'
                  }}
                >
                  Module {m.order}: {m.title}
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 11,
                      padding: '1px 6px',
                      borderRadius: 12,
                      background: isActive ? 'rgba(255,255,255,0.25)' : '#f2f4f7',
                      color: isActive ? '#fff' : '#475467'
                    }}
                  >
                    {m.lessons?.length || 0}
                  </span>
                </button>
              );
            })}
            <button
              onClick={openAddModuleModal}
              className="btn btn-outline"
              style={{ padding: '8px 14px', fontSize: 13, borderRadius: 8, borderStyle: 'dashed', flexShrink: 0 }}
            >
              + Add Module
            </button>

            {/* Dedicated Final Course Assessment Tab */}
            <button
              onClick={() => setActiveModuleId('FINAL_EXAM')}
              style={{
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: activeModuleId === 'FINAL_EXAM' ? 700 : 500,
                borderRadius: 8,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                border: activeModuleId === 'FINAL_EXAM' ? '1px solid #4f46e5' : '1px solid #c7d2fe',
                background: activeModuleId === 'FINAL_EXAM' ? '#4f46e5' : '#eef2ff',
                color: activeModuleId === 'FINAL_EXAM' ? '#fff' : '#3730a3',
                boxShadow: activeModuleId === 'FINAL_EXAM' ? '0 2px 8px rgba(79, 70, 229, 0.3)' : 'none',
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <GraduationCap size={15} /> Final Assessment
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 11,
                  padding: '1px 6px',
                  borderRadius: 12,
                  background: activeModuleId === 'FINAL_EXAM' ? 'rgba(255,255,255,0.25)' : '#c7d2fe',
                  color: activeModuleId === 'FINAL_EXAM' ? '#fff' : '#3730a3'
                }}
              >
                {finalExamForm.enabled ? `${c?.finalExam?.questions?.length || 0} Qs` : 'Off'}
              </span>
            </button>
          </div>
        )}

        {/* Active Module Content View Panel */}
        {currentActiveModule && (
          <div
            key={currentActiveModule.id}
            style={{
              borderRadius: 12,
              background: '#fafafa',
              border: '1px solid var(--line)',
              overflow: 'hidden'
            }}
          >
            {/* Module Header Bar */}
            <div
              style={{
                padding: '16px 20px',
                background: '#f1f5f9',
                borderBottom: '1px solid var(--line)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <b style={{ fontSize: 16 }}>Module {currentActiveModule.order}: {currentActiveModule.title}</b>
                <span className="small muted" style={{ marginLeft: 12 }}>({currentActiveModule.lessons?.length || 0} Lessons)</span>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  className="btn btn-outline"
                  style={{ padding: '5px 10px', fontSize: 12, background: '#fff', borderColor: '#d0d5dd', color: '#344054', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  onClick={() => openEditModuleModal(currentActiveModule)}
                >
                  <Edit3 size={13} /> Edit Module
                </button>
                <button
                  className="btn btn-outline"
                  style={{ padding: '5px 10px', fontSize: 12, background: '#fff', borderColor: '#fee4e2', color: '#d92d20', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  onClick={() => handleDeleteModule(currentActiveModule.id)}
                >
                  <Trash2 size={13} /> Delete Module
                </button>
                <Link
                  href={`/admin/courses/${id}/lessons/new?moduleId=${currentActiveModule.id}`}
                  className="btn btn-primary"
                  style={{ padding: '6px 14px', fontSize: 12, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  + Add Lesson (Dedicated Page)
                </Link>
              </div>
            </div>

            {/* Module Lessons Container */}
            <div style={{ padding: 16, display: 'grid', gap: 10 }}>
              {currentActiveModule.lessons?.length === 0 && (
                <div className="small muted" style={{ fontStyle: 'italic', padding: '16px 0', textAlign: 'center' }}>
                  No lessons in this module. Click <strong>"+ Add Lesson (Dedicated Page)"</strong> above to create one.
                </div>
              )}
              {currentActiveModule.lessons?.map((l: any) => (
                <div
                  key={l.id}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 8,
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="tag" style={{ fontSize: 11, padding: '3px 8px' }}>{l.type}</span>
                    <strong style={{ fontSize: 14, color: 'var(--ink)' }}>{l.title}</strong>
                    {l.type === 'QUIZ' && l.quiz && (
                      <span style={{ fontSize: 11, color: '#475467', background: '#f2f4f7', padding: '2px 8px', borderRadius: 12, fontWeight: 500 }}>
                        Pass: {l.quiz.passingScore}% | {l.quiz.questions?.length || 0} Qs | {l.quiz.timeLimitMinutes || 10}m
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    {l.type === 'QUIZ' && (
                      <button
                        className="btn btn-outline"
                        style={{ padding: '4px 10px', fontSize: 11, color: '#027a48', borderColor: '#abefc6', background: '#ecfdf3', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        onClick={() => openQuestionsModal(l)}
                      >
                        <HelpCircle size={13} /> Questions ({l.quiz?.questions?.length || 0})
                      </button>
                    )}
                    <Link
                      href={`/admin/courses/${id}/lessons/${l.id}`}
                      className="btn btn-outline"
                      style={{ padding: '4px 10px', fontSize: 11, color: '#344054', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                    >
                      Edit Lesson (Dedicated Page)
                    </Link>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '4px 10px', fontSize: 11, color: '#d92d20', borderColor: '#fee4e2' }}
                      onClick={() => handleDeleteLesson(l.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Final Course Assessment View Panel */}
        {activeModuleId === 'FINAL_EXAM' && (
          <div
            style={{
              borderRadius: 12,
              background: '#fafafa',
              border: '1px solid var(--line)',
              overflow: 'hidden'
            }}
          >
            {/* Final Exam Header Bar */}
            <div
              style={{
                padding: '16px 20px',
                background: '#eef2ff',
                borderBottom: '1px solid #c7d2fe',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <b style={{ fontSize: 16, color: '#3730a3', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <GraduationCap size={18} color="#3730a3" /> Course Final Exam & Assessment
                </b>
                <span className="small muted" style={{ marginLeft: 12 }}>
                  (Required exam students must pass to complete course and earn certificate)
                </span>
              </div>
              <span
                className="tag"
                style={{
                  background: finalExamForm.enabled ? '#ecfdf3' : '#f2f4f7',
                  color: finalExamForm.enabled ? '#027a48' : '#344054',
                  fontWeight: 700
                }}
              >
                {finalExamForm.enabled ? 'ACTIVE & ENABLED' : 'DISABLED'}
              </span>
            </div>

            <div style={{ padding: 24, display: 'grid', gap: 20 }}>
              {/* Enable / Disable Card */}
              <div style={{ padding: 20, background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: 16, color: 'var(--ink)' }}>Enable Final Assessment</h3>
                  <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                    When enabled, students are required to take and pass this exam after finishing module lessons to receive their course certificate.
                  </p>
                </div>
                <button
                  className="btn"
                  style={{
                    background: finalExamForm.enabled ? '#d92d20' : '#4f46e5',
                    color: '#fff',
                    padding: '8px 18px',
                    fontSize: 13,
                    fontWeight: 600,
                    border: 0,
                    borderRadius: 8,
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    const nextState = !finalExamForm.enabled;
                    setFinalExamForm(prev => ({ ...prev, enabled: nextState }));
                    handleSaveFinalExam(nextState);
                  }}
                >
                  {finalExamForm.enabled ? 'Disable Final Exam' : 'Enable Final Exam'}
                </button>
              </div>

              {/* Settings Card */}
              {finalExamForm.enabled && (
                <>
                  <div style={{ padding: 20, background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 14px', fontSize: 15, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Settings size={16} /> Final Exam Configuration
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                      <div className="field">
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>PASSING SCORE (%)</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={finalExamForm.passingScore}
                          onChange={e => setFinalExamForm({ ...finalExamForm, passingScore: e.target.value })}
                        />
                      </div>
                      <div className="field">
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>MAX ATTEMPTS (OPTIONAL)</label>
                        <input
                          type="number"
                          placeholder="Unlimited if left empty"
                          value={finalExamForm.maxAttempts}
                          onChange={e => setFinalExamForm({ ...finalExamForm, maxAttempts: e.target.value })}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button
                          className="btn btn-primary"
                          style={{ width: '100%', height: 42, fontSize: 13, justifyContent: 'center' }}
                          disabled={isSavingFinalExam}
                          onClick={() => handleSaveFinalExam()}
                        >
                          {isSavingFinalExam ? 'Saving...' : 'Save Settings'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Questions List Card */}
                  <div style={{ padding: 20, background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: 16, color: 'var(--ink)' }}>
                          Final Exam Questions ({c?.finalExam?.questions?.length || 0})
                        </h4>
                        <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>
                          Questions presented to students during the final assessment exam.
                        </p>
                      </div>
                      {c?.finalExam && (
                        <button
                          className="btn btn-primary"
                          style={{ padding: '6px 14px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                          onClick={() => openQuestionsModal(c.finalExam)}
                        >
                          <HelpCircle size={15} /> Manage / Add Questions
                        </button>
                      )}
                    </div>

                    {(!c?.finalExam?.questions || c.finalExam.questions.length === 0) && (
                      <div style={{ padding: 30, textAlign: 'center', background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1' }}>
                        <p className="muted" style={{ margin: '0 0 12px', fontSize: 14 }}>
                          No questions added to the final exam yet.
                        </p>
                        {c?.finalExam && (
                          <button className="btn btn-primary" onClick={() => openQuestionsModal(c.finalExam)}>
                            + Add First Question
                          </button>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'grid', gap: 12 }}>
                      {c?.finalExam?.questions?.map((q: any, qIdx: number) => (
                        <div key={q.id} style={{ padding: 16, borderRadius: 8, border: '1px solid #eaecf0', background: '#fafafa' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <span className="tag" style={{ fontSize: 10, padding: '2px 6px', marginRight: 8 }}>
                                Q{qIdx + 1} • {q.type} • {q.points} PTS
                              </span>
                              <h4 style={{ margin: '6px 0 0', fontSize: 15, color: 'var(--ink)' }}>{q.question}</h4>
                            </div>
                            <button
                              className="btn btn-outline"
                              style={{ padding: '3px 8px', fontSize: 11, color: '#d92d20', borderColor: '#fee4e2', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                              onClick={() => handleDeleteQuestion(q.id)}
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>

                          <div style={{ marginTop: 10, display: 'grid', gap: 6 }}>
                            {q.options?.map((opt: any) => (
                              <div
                                key={opt.id}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: 6,
                                  fontSize: 13,
                                  background: opt.isCorrect ? '#ecfdf3' : '#fff',
                                  border: opt.isCorrect ? '1px solid #abefc6' : '1px solid #e2e8f0',
                                  color: opt.isCorrect ? '#027a48' : '#344054',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}
                              >
                                <span>{opt.text}</span>
                                {opt.isCorrect && (
                                  <span style={{ fontWeight: 700, fontSize: 11, color: '#027a48' }}>✓ Correct Answer</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 1. MODULE MODAL POPUP DIALOG */}
      {/* ======================================================== */}
      {showModuleModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 20
          }}
        >
          <div className="card" style={{ width: 500, padding: 30, background: '#fff', borderRadius: 14, boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                {editingModuleId ? <Edit3 size={20} /> : <PlusCircle size={20} />} {editingModuleId ? 'Edit Module' : 'Add New Module'}
              </h3>
              <button
                style={{ border: 0, background: 'transparent', fontSize: 20, cursor: 'pointer', color: '#667085', display: 'flex', alignItems: 'center' }}
                onClick={() => setShowModuleModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="form">
              <div className="field">
                <label>MODULE TITLE *</label>
                <input
                  required
                  placeholder="e.g. Module 1: Core Fundamentals"
                  value={moduleTitleInput}
                  onChange={e => setModuleTitleInput(e.target.value)}
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                <button className="btn btn-outline" onClick={() => setShowModuleModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSaveModule}>
                  {editingModuleId ? 'Save Changes' : 'Create Module'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. LESSON MODAL POPUP DIALOG */}
      {/* ======================================================== */}
      {showLessonModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 20
          }}
        >
          <div
            className="card"
            style={{
              width: 600,
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 30,
              background: '#fff',
              borderRadius: 14,
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                {editingLessonId ? <Edit3 size={20} /> : <PlusCircle size={20} />} {editingLessonId ? 'Edit Lesson' : 'Add New Lesson'}
              </h3>
              <button
                style={{ border: 0, background: 'transparent', fontSize: 20, cursor: 'pointer', color: '#667085', display: 'flex', alignItems: 'center' }}
                onClick={() => setShowLessonModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="form">
              <div className="field">
                <label>TARGET MODULE *</label>
                <select
                  required
                  value={lessonForm.moduleId}
                  onChange={e => setLessonForm({ ...lessonForm, moduleId: e.target.value })}
                >
                  <option value="">-- Select Module --</option>
                  {c?.modules?.map((m: any) => (
                    <option key={m.id} value={m.id}>
                      Module {m.order}: {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>LESSON TITLE *</label>
                <input
                  required
                  placeholder="e.g. Introduction & Key Terms"
                  value={lessonForm.title}
                  onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field">
                  <label>LESSON TYPE</label>
                  <select
                    value={lessonForm.type}
                    onChange={e => setLessonForm({ ...lessonForm, type: e.target.value })}
                  >
                    <option value="TEXT">Text / HTML</option>
                    <option value="VIDEO">Video</option>
                    <option value="IMAGE">Image</option>
                    <option value="PDF">PDF Document</option>
                    <option value="QUIZ">Quiz Assessment</option>
                  </select>
                </div>
                <div className="field">
                  <label>ORDER NUMBER</label>
                  <input
                    type="number"
                    value={lessonForm.order}
                    onChange={e => setLessonForm({ ...lessonForm, order: e.target.value })}
                  />
                </div>
              </div>

              {/* Word-Style Rich Text Editor */}
              {(lessonForm.type === 'TEXT' || lessonForm.type === 'RICH_TEXT') && (
                <div className="field" style={{ marginTop: 10 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>LESSON CONTENT (WORD RICH TEXT EDITOR) *</span>
                    <span style={{ fontSize: 11, fontWeight: 500, color: '#6366f1' }}>Visual Canvas Enabled</span>
                  </label>
                  <RichTextEditor
                    value={textContent}
                    onChange={html => setTextContent(html)}
                    placeholder="Type lesson text, add headings, bold text, bullet points, blockquotes, or links..."
                  />
                </div>
              )}

              {/* Media URL + S3 Media Asset Upload */}
              {(lessonForm.type === 'VIDEO' || lessonForm.type === 'IMAGE' || lessonForm.type === 'PDF') && (
                <div style={{ marginTop: 10 }}>
                  <div className="field">
                    <label>{lessonForm.type} MEDIA URL</label>
                    <input
                      placeholder={`Paste ${lessonForm.type} URL or upload file to S3 below...`}
                      value={mediaUrl}
                      onChange={e => setMediaUrl(e.target.value)}
                    />
                  </div>
                  <FileUpload
                    label={`OR Upload ${lessonForm.type} File Directly to Cloudinary`}
                    accept={lessonForm.type === 'VIDEO' ? 'video/*' : lessonForm.type === 'IMAGE' ? 'image/*' : 'application/pdf'}
                    placeholderUrl={mediaUrl}
                    onUploadSuccess={url => setMediaUrl(url)}
                  />
                </div>
              )}

              {/* Quiz Configuration Settings */}
              {lessonForm.type === 'QUIZ' && (
                <div style={{ marginTop: 12, padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: 14, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Settings size={16} /> Quiz Assessment Configuration
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="field">
                      <label>PASSING SCORE (%)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        placeholder="70"
                        value={quizPassingScore}
                        onChange={e => setQuizPassingScore(e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label>TIME LIMIT (MINUTES)</label>
                      <input
                        type="number"
                        min="1"
                        max="300"
                        placeholder="10"
                        value={quizTimeLimit}
                        onChange={e => setQuizTimeLimit(e.target.value)}
                      />
                    </div>
                  </div>
                  <p className="muted" style={{ margin: '8px 0 0', fontSize: 12 }}>
                    ℹ️ Standard default score is 70%. You can add/manage questions after creating the quiz lesson.
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                <button className="btn btn-outline" onClick={() => setShowLessonModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSaveLesson}>
                  {editingLessonId ? 'Save Lesson Changes' : 'Create Lesson'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. MANAGE QUIZ QUESTIONS MODAL POPUP DIALOG */}
      {/* ======================================================== */}
      {showQuestionModal && activeQuizLesson && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 110,
            padding: 20
          }}
        >
          <div
            className="card"
            style={{
              width: 800,
              maxHeight: '92vh',
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
                <span className="eyebrow">QUIZ QUESTION MANAGER</span>
                <h2 style={{ margin: '4px 0 0', fontSize: 22 }}>
                  {activeQuizLesson.title}
                </h2>
                <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>
                  Configure passing threshold, time limits, and edit questions.
                </p>
              </div>
              <button
                style={{ border: 0, background: 'transparent', fontSize: 24, cursor: 'pointer', color: '#667085' }}
                onClick={() => setShowQuestionModal(false)}
              >
                ✕
              </button>
            </div>

            {/* Quiz Settings Bar */}
            <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <b style={{ fontSize: 15, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Settings size={16} /> Quiz Settings
                </b>
                <button
                  className="btn btn-outline"
                  style={{ padding: '6px 14px', fontSize: 12, background: '#fff' }}
                  onClick={handleSaveQuizSettings}
                >
                  Save Quiz Settings
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="field">
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#475467' }}>PASSING SCORE (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="70"
                    value={quizSettingsForm.passingScore}
                    onChange={e => setQuizSettingsForm({ ...quizSettingsForm, passingScore: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#475467' }}>TIME LIMIT (MINUTES)</label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    placeholder="10"
                    value={quizSettingsForm.timeLimitMinutes}
                    onChange={e => setQuizSettingsForm({ ...quizSettingsForm, timeLimitMinutes: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Question List */}
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 16, margin: '0 0 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Existing Questions ({activeQuizLesson.quiz?.questions?.length || 0})</span>
              </h3>

              {(!activeQuizLesson.quiz?.questions || activeQuizLesson.quiz.questions.length === 0) && (
                <div style={{ padding: 24, textAlign: 'center', background: '#fff', border: '1px dashed #d0d5dd', borderRadius: 10 }}>
                  <p className="muted" style={{ margin: 0, fontSize: 14 }}>
                    No questions added yet. Use the form below to add your first question.
                  </p>
                </div>
              )}

              <div style={{ display: 'grid', gap: 12 }}>
                {activeQuizLesson.quiz?.questions?.map((q: any, qIdx: number) => (
                  <div
                    key={q.id}
                    style={{
                      padding: 16,
                      borderRadius: 10,
                      border: '1px solid #eaecf0',
                      background: '#fff'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span className="tag" style={{ fontSize: 10, padding: '2px 6px', marginRight: 8 }}>
                          Q{qIdx + 1} • {q.type} • {q.points} PTS
                        </span>
                        <h4 style={{ margin: '6px 0 0', fontSize: 15, color: 'var(--ink)' }}>{q.question}</h4>
                      </div>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '3px 8px', fontSize: 11, color: '#d92d20', borderColor: '#fee4e2', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        onClick={() => handleDeleteQuestion(q.id)}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>

                    <div style={{ marginTop: 10, display: 'grid', gap: 6 }}>
                      {q.options?.map((opt: any) => (
                        <div
                          key={opt.id}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 6,
                            fontSize: 13,
                            background: opt.isCorrect ? '#ecfdf3' : '#f8fafc',
                            border: opt.isCorrect ? '1px solid #abefc6' : '1px solid #f1f5f9',
                            color: opt.isCorrect ? '#027a48' : '#344054',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <span>{opt.text}</span>
                          {opt.isCorrect && (
                            <span style={{ fontWeight: 700, fontSize: 11, color: '#027a48' }}>✓ Correct Answer</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Question Section */}
            <div style={{ padding: 20, background: '#fafafa', borderRadius: 12, border: '1px solid var(--line)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 16, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <PlusCircle size={18} color="#6366f1" /> Add New Question
              </h3>
              <div className="form" style={{ maxWidth: 'none' }}>
                <div className="field">
                  <label>QUESTION PROMPT / STATEMENT *</label>
                  <input
                    placeholder="e.g. Which keyword is used to declare a constant in JavaScript?"
                    value={newQuestion.question}
                    onChange={e => setNewQuestion({ ...newQuestion, question: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="field">
                    <label>QUESTION TYPE</label>
                    <select
                      value={newQuestion.type}
                      onChange={e => handleTypeChange(e.target.value)}
                    >
                      <option value="SINGLE_CHOICE">Single Choice (Radio)</option>
                      <option value="MULTIPLE_CHOICE">Multiple Choice (Checkboxes)</option>
                      <option value="TRUE_FALSE">True / False</option>
                    </select>
                  </div>

                  <div className="field">
                    <label>POINTS</label>
                    <input
                      type="number"
                      value={newQuestion.points}
                      onChange={e => setNewQuestion({ ...newQuestion, points: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Answer Options */}
                <div style={{ marginTop: 12 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#344054', display: 'block', marginBottom: 8 }}>
                    ANSWER OPTIONS * (Check correct answer)
                  </label>

                  <div style={{ display: 'grid', gap: 10 }}>
                    {newQuestion.options.map((opt, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <input
                          type={newQuestion.type === 'MULTIPLE_CHOICE' ? 'checkbox' : 'radio'}
                          name="correctOption"
                          checked={opt.isCorrect}
                          onChange={e => handleOptionCorrectChange(idx, e.target.checked)}
                          style={{ width: 18, height: 18, cursor: 'pointer', flexShrink: 0 }}
                          title="Mark as correct answer"
                        />
                        <input
                          style={{ flex: 1, border: '1px solid var(--line)', borderRadius: 8, padding: '10px 12px' }}
                          placeholder={`Option ${idx + 1} text...`}
                          value={opt.text}
                          disabled={newQuestion.type === 'TRUE_FALSE'}
                          onChange={e => handleOptionTextChange(idx, e.target.value)}
                        />
                        {newQuestion.type !== 'TRUE_FALSE' && (
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: '8px 12px', fontSize: 12, color: '#d92d20', borderColor: '#fee4e2' }}
                            onClick={() => handleRemoveOptionField(idx)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {newQuestion.type !== 'TRUE_FALSE' && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ marginTop: 12, padding: '6px 14px', fontSize: 12, background: '#fff' }}
                      onClick={handleAddOptionField}
                    >
                      + Add Option
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                  <button
                    className="btn btn-primary"
                    disabled={isSubmittingQuestion}
                    onClick={handleAddQuestionSubmit}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    {isSubmittingQuestion ? 'Adding Question...' : <><PlusCircle size={15} /> Save & Add Question</>}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, paddingTop: 16, borderTop: '1px solid #eaecf0' }}>
              <button className="btn btn-outline" onClick={() => setShowQuestionModal(false)}>
                Done & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CUSTOM ALERT POPUP MODAL */}
      {/* ======================================================== */}
      {alertModal.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 300,
            padding: 20
          }}
        >
          <div
            className="card"
            style={{
              width: 420,
              padding: 28,
              background: '#fff',
              borderRadius: 14,
              boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
              textAlign: 'center'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              {alertModal.type === 'error' ? (
                <AlertCircle size={44} color="#ef4444" />
              ) : alertModal.type === 'success' ? (
                <CheckCircle2 size={44} color="#10b981" />
              ) : alertModal.type === 'warning' ? (
                <AlertTriangle size={44} color="#f59e0b" />
              ) : (
                <Info size={44} color="#3b82f6" />
              )}
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, color: 'var(--ink)' }}>{alertModal.title}</h3>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: '#475467', lineHeight: 1.5 }}>
              {alertModal.message}
            </p>
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '11px 16px', fontSize: 14 }}
              onClick={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
            >
              OK, Got It
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CUSTOM CONFIRMATION POPUP MODAL */}
      {/* ======================================================== */}
      {confirmModal.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 300,
            padding: 20
          }}
        >
          <div
            className="card"
            style={{
              width: 440,
              padding: 28,
              background: '#fff',
              borderRadius: 14,
              boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
              textAlign: 'center'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              {confirmModal.danger ? <Trash2 size={44} color="#ef4444" /> : <HelpCircle size={44} color="#6366f1" />}
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 19, color: 'var(--ink)' }}>{confirmModal.title}</h3>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: '#475467', lineHeight: 1.5 }}>
              {confirmModal.message}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                className="btn btn-outline"
                style={{ flex: 1, padding: '11px 16px', fontSize: 14, borderColor: '#d0d5dd', color: '#344054' }}
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
              >
                {confirmModal.cancelText || 'Cancel'}
              </button>
              <button
                className="btn"
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  fontSize: 14,
                  background: confirmModal.danger ? '#d92d20' : 'var(--orange)',
                  color: '#fff',
                  border: 0,
                  fontWeight: 600
                }}
                onClick={() => {
                  const action = confirmModal.onConfirm;
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                  action();
                }}
              >
                {confirmModal.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
