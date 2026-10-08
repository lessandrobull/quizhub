import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface FocusArea {
  studentSaid: string;
  betterWay: string;
  explanation: string;
  examples: string[];
}

interface Question {
  number: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuizData {
  studentName: string;
  date: string;
  level: string;
  levelDescription: string;
  focusAreas: FocusArea[];
  quiz: Question[];
  homework?: string;
}

export default function QuizView() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const isTeacherRoute = location.pathname.startsWith('/teacher');

  const [data, setData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);

  // Student Interactivity States (View Mode)
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState(0);

  // Teacher Editorial States (Edit Mode)
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<QuizData | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; color: string } | null>(null);

  useEffect(() => {
    async function loadQuiz() {
      if (!sessionId) return;
      setLoading(true);

      const { data: quizRecord, error } = await supabase
        .from('student_quizzes')
        .select(`
          level,
          level_description,
          focus_areas,
          questions,
          homework,
          class_sessions (
            class_date,
            students (
              name
            )
          )
        `)
        .eq('session_id', sessionId)
        .single();

      if (!error && quizRecord) {
        const sessionInfo = quizRecord.class_sessions as any;
        const parsedData: QuizData = {
          studentName: sessionInfo?.students?.name || 'Student',
          date: sessionInfo?.class_date || '',
          level: quizRecord.level || 'B2 (Upper-Intermediate)',
          levelDescription: quizRecord.level_description || '',
          focusAreas: (quizRecord.focus_areas as FocusArea[]) || [],
          quiz: (quizRecord.questions as Question[]) || [],
          homework: quizRecord.homework || ''
        };
        setData(parsedData);
        setEditData(JSON.parse(JSON.stringify(parsedData)));
      }
      setLoading(false);
    }

    loadQuiz();
  }, [sessionId]);

  // Student Answer Selection
  const handleSelectOption = (qIndex: number, selectedLetter: string, correctLetter: string) => {
    if (userAnswers[qIndex]) return;
    setUserAnswers(prev => ({ ...prev, [qIndex]: selectedLetter }));
    if (selectedLetter.toUpperCase() === correctLetter.toUpperCase()) {
      setScore(prev => prev + 1);
    }
  };

  // Toggle Edit Mode
  const handleToggleEdit = () => {
    if (!isEditing && data) {
      setEditData(JSON.parse(JSON.stringify(data)));
      setIsEditing(true);
    } else {
      setIsEditing(false);
      setStatusMsg(null);
    }
  };

  // Save Changes to Supabase
  const handleSaveChanges = async () => {
    if (!editData || !sessionId) return;
    setSaving(true);
    setStatusMsg({ text: 'Saving changes...', color: '#27427f' });

    try {
      const { error } = await supabase
        .from('student_quizzes')
        .update({
          level: editData.level,
          level_description: editData.levelDescription,
          focus_areas: editData.focusAreas,
          questions: editData.quiz,
          homework: editData.homework || null
        })
        .eq('session_id', sessionId);

      if (error) throw error;

      setData(JSON.parse(JSON.stringify(editData)));
      setIsEditing(false);
      setStatusMsg({ text: 'Changes saved successfully.', color: '#15803d' });
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err: any) {
      setStatusMsg({ text: 'Error saving: ' + (err.message || 'Connection failed'), color: '#b91c1c' });
    } finally {
      setSaving(false);
    }
  };

  // Edit State Modifiers
  const updateFocusArea = (index: number, field: keyof FocusArea, value: any) => {
    if (!editData) return;
    const updated = [...editData.focusAreas];
    updated[index] = { ...updated[index], [field]: value };
    setEditData({ ...editData, focusAreas: updated });
  };

  const updateFocusExample = (areaIndex: number, exampleIndex: number, value: string) => {
    if (!editData) return;
    const updated = [...editData.focusAreas];
    const examples = [...(updated[areaIndex].examples || [])];
    examples[exampleIndex] = value;
    updated[areaIndex] = { ...updated[areaIndex], examples };
    setEditData({ ...editData, focusAreas: updated });
  };

  const updateQuestion = (qIndex: number, field: keyof Question, value: any) => {
    if (!editData) return;
    const updated = [...editData.quiz];
    updated[qIndex] = { ...updated[qIndex], [field]: value };
    setEditData({ ...editData, quiz: updated });
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    if (!editData) return;
    const updated = [...editData.quiz];
    const options = [...updated[qIndex].options];
    options[optIndex] = value;
    updated[qIndex] = { ...updated[qIndex], options };
    setEditData({ ...editData, quiz: updated });
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#a6b1ca', minHeight: '100vh', padding: 40, textAlign: 'center', color: '#27427f', fontWeight: 'bold' }}>
        Loading assessment...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ backgroundColor: '#a6b1ca', minHeight: '100vh', padding: 40, textAlign: 'center', color: '#b91c1c', fontWeight: 'bold' }}>
        Quiz not found for this session.
      </div>
    );
  }

  const currentLevel = (isEditing && editData ? editData.level : data.level).toUpperCase();
  const isPt = currentLevel.includes('A1');

  let levelLabel = isEditing && editData ? editData.level : data.level;
  if (isPt && levelLabel.includes('A1')) {
    levelLabel = 'A1 (Iniciante)';
  }

  const focusTitle = isPt ? 'Área de Foco' : 'Focus Areas';
  const quizTitle = isPt ? 'Praticar o Quiz' : 'Practice Quiz';
  const expLabel = isPt ? 'Explicação:' : 'Explanation:';
  const homeworkTitle = isPt ? 'Lição de Casa' : 'Homework';

  const totalQuestions = data.quiz.length;
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div style={{
      backgroundColor: '#a6b1ca',
      minHeight: '100vh',
      padding: isTeacherRoute ? '24px 16px 48px' : '12px 14px 40px 14px',
      color: '#1e293b'
    }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>

        {/* ADMIN ONLY: Card 1 - Main Banner */}
        {isTeacherRoute && (
          <div style={{
            backgroundColor: '#27427f',
            borderRadius: 18,
            padding: '16px 20px',
            textAlign: 'center',
            marginBottom: 16,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <div style={{ color: '#71c499', fontSize: '1.15rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              PEDAGOGICAL DASHBOARD • QUIZ
            </div>
          </div>
        )}

        {/* ADMIN ONLY: Card 2 - Navigation & Editorial Card */}
        {isTeacherRoute && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 10,
            padding: '12px 18px',
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            borderBottom: '4px solid #27427f'
          }}>
            <Link
              to={`/teacher/briefing/${sessionId}`}
              style={{
                color: '#27427f',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.88rem'
              }}
            >
              ← Back to Briefing
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {statusMsg && (
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: statusMsg.color }}>
                  {statusMsg.text}
                </span>
              )}

              {!isEditing ? (
                <button
                  type="button"
                  onClick={handleToggleEdit}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#27427f',
                    border: '1px solid #27427f',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    textTransform: 'uppercase'
                  }}
                >
                  EDIT CONTENT
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleToggleEdit}
                    style={{
                      backgroundColor: '#eaeffa',
                      color: '#27427f',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: 8,
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      textTransform: 'uppercase'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSaveChanges}
                    style={{
                      backgroundColor: saving ? '#94a3b8' : '#71c499',
                      color: '#27427f',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: 8,
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      textTransform: 'uppercase'
                    }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Student View Starts Here (Header) */}
        <header style={{
          backgroundColor: '#27427f',
          borderRadius: 18,
          padding: 16,
          textAlign: 'center',
          marginBottom: 16,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <h1 style={{ fontSize: 19, fontWeight: 800, color: '#71c499', margin: 0, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Conversation Assessment
          </h1>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#eaeffa', marginTop: 4 }}>
            {data.studentName} • {data.date}
          </div>
        </header>

        {/* 1. Level & Fluency Assessment (4 Sentences) */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ backgroundColor: '#27427f', color: '#eaeffa', fontWeight: 700, fontSize: 13, textAlign: 'center', padding: '8px 14px', borderRadius: 10, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            {levelLabel}
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: 16, borderRadius: 10, borderBottom: '4px solid #27427f', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: 14.5, lineHeight: 1.6 }}>
            {!isEditing ? (
              data.levelDescription
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#27427f', marginBottom: 4, textTransform: 'uppercase' }}>
                  CEFR Level:
                </label>
                <input
                  type="text"
                  value={editData?.level || ''}
                  onChange={(e) => setEditData(prev => prev ? { ...prev, level: e.target.value } : null)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', marginBottom: 12, fontSize: 14, outline: 'none' }}
                />

                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#27427f', marginBottom: 4, textTransform: 'uppercase' }}>
                  Fluency Assessment (Exactly 4 sentences - No CEFR code):
                </label>
                <textarea
                  rows={4}
                  value={editData?.levelDescription || ''}
                  onChange={(e) => setEditData(prev => prev ? { ...prev, levelDescription: e.target.value } : null)}
                  style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, lineHeight: 1.5, resize: 'vertical', outline: 'none' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* 2. Focus Areas (5 Items) */}
        {((isEditing ? editData?.focusAreas : data.focusAreas) || []).length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ backgroundColor: '#27427f', color: '#eaeffa', fontWeight: 700, fontSize: 13, textAlign: 'center', padding: '8px 14px', borderRadius: 10, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              {focusTitle}
            </div>

            {!isEditing ? (
              data.focusAreas.map((fa, i) => (
                <div key={i} style={{ backgroundColor: '#ffffff', borderRadius: 10, borderBottom: '4px solid #27427f', padding: '14px 16px', marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <div style={{ color: '#b91c1c', fontWeight: 600, fontSize: 14.5, marginBottom: 4 }}>{fa.studentSaid}</div>
                  <div style={{ color: '#0b5394', fontWeight: 700, fontSize: 15, marginBottom: 10 }}>{fa.betterWay}</div>
                  <div style={{ backgroundColor: '#eaeffa', borderRadius: 8, padding: '10px 12px', fontSize: 13.5, lineHeight: 1.5 }}>
                    <div style={{ marginBottom: 8 }}>
                      <strong style={{ color: '#27427f' }}>{expLabel}</strong> {fa.explanation}
                    </div>
                    {fa.examples && fa.examples.length > 0 && (
                      <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: 6 }}>
                        {fa.examples.map((ex, j) => (
                          <div key={j} style={{ color: '#334155', fontStyle: 'italic', fontSize: 13, marginTop: 3 }}>• {ex}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              editData?.focusAreas.map((fa, i) => (
                <div key={i} style={{ backgroundColor: '#ffffff', borderRadius: 10, borderBottom: '4px solid #27427f', padding: '14px 16px', marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#27427f', marginBottom: 8 }}>
                    FOCUS ITEM #{i + 1}
                  </div>

                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#b91c1c', marginBottom: 2 }}>STUDENT SAID:</label>
                  <input
                    type="text"
                    value={fa.studentSaid}
                    onChange={(e) => updateFocusArea(i, 'studentSaid', e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', marginBottom: 8, fontSize: 13.5 }}
                  />

                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0b5394', marginBottom: 2 }}>BETTER WAY:</label>
                  <input
                    type="text"
                    value={fa.betterWay}
                    onChange={(e) => updateFocusArea(i, 'betterWay', e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', marginBottom: 8, fontSize: 13.5 }}
                  />

                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#27427f', marginBottom: 2 }}>CONCISE EXPLANATION:</label>
                  <textarea
                    rows={2}
                    value={fa.explanation}
                    onChange={(e) => updateFocusArea(i, 'explanation', e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', marginBottom: 8, fontSize: 13 }}
                  />

                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 2 }}>3 USAGE EXAMPLES:</label>
                  {(fa.examples || ['', '', '']).map((ex, exIdx) => (
                    <input
                      key={exIdx}
                      type="text"
                      value={ex}
                      onChange={(e) => updateFocusExample(i, exIdx, e.target.value)}
                      placeholder={`Example ${exIdx + 1}`}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', marginBottom: 4, fontSize: 13 }}
                    />
                  ))}
                </div>
              ))
            )}
          </div>
        )}

        {/* 3. Practice Quiz (10 Multiple Choice Questions) */}
        {((isEditing ? editData?.quiz : data.quiz) || []).length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ backgroundColor: '#27427f', color: '#eaeffa', fontWeight: 700, fontSize: 13, textAlign: 'center', padding: '8px 14px', borderRadius: 10, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              {quizTitle}
            </div>

            {!isEditing ? (
              data.quiz.map((item, q) => {
                const selected = userAnswers[q];
                const isAnswered = !!selected;

                return (
                  <div key={q} style={{ backgroundColor: '#ffffff', borderRadius: 10, borderBottom: '4px solid #27427f', padding: 16, marginBottom: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#27427f', marginBottom: 12 }}>
                      {item.number}. {item.question}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {item.options.map((optText, optIdx) => {
                        const optLetter = optText.charAt(0).toUpperCase();
                        const isCorrect = optLetter === item.correctAnswer.toUpperCase();
                        const isSelected = optLetter === selected?.toUpperCase();

                        let btnBg = '#eaeffa';
                        let btnBorder = 'transparent';
                        let btnColor = '#1e293b';

                        if (isAnswered) {
                          if (isCorrect) {
                            btnBg = '#dcfce7';
                            btnBorder = '#22c55e';
                            btnColor = '#15803d';
                          } else if (isSelected) {
                            btnBg = '#fee2e2';
                            btnBorder = '#ef4444';
                            btnColor = '#b91c1c';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={isAnswered}
                            onClick={() => handleSelectOption(q, optLetter, item.correctAnswer)}
                            style={{
                              backgroundColor: btnBg,
                              border: `1px solid ${btnBorder}`,
                              borderRadius: 8,
                              padding: '10px 14px',
                              fontSize: 14,
                              textAlign: 'left',
                              cursor: isAnswered ? 'default' : 'pointer',
                              fontWeight: 600,
                              color: btnColor,
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {optText}
                          </button>
                        );
                      })}
                    </div>

                    {isAnswered && (
                      <div style={{ marginTop: 10, padding: '10px 12px', backgroundColor: '#eaeffa', borderRadius: 8, fontSize: 13.5, lineHeight: 1.5 }}>
                        <strong style={{ color: '#27427f' }}>{expLabel}</strong> {item.explanation}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              editData?.quiz.map((item, q) => (
                <div key={q} style={{ backgroundColor: '#ffffff', borderRadius: 10, borderBottom: '4px solid #27427f', padding: 16, marginBottom: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <div style={{ display: 'flex', borderBottom: '1px solid #cbd5e1', paddingBottom: 8, justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 13, color: '#27427f' }}>
                      QUESTION #{item.number}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#27427f' }}>Answer Key:</span>
                      <select
                        value={item.correctAnswer}
                        onChange={(e) => updateQuestion(q, 'correctAnswer', e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontWeight: 800, color: '#27427f' }}
                      >
                        {['A', 'B', 'C', 'D', 'E'].map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 2 }}>QUESTION PROMPT:</label>
                  <textarea
                    rows={2}
                    value={item.question}
                    onChange={(e) => updateQuestion(q, 'question', e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', marginBottom: 10, fontSize: 13.5 }}
                  />

                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4 }}>OPTIONS (A to E):</label>
                  {item.options.map((opt, optIdx) => (
                    <input
                      key={optIdx}
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(q, optIdx, e.target.value)}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', marginBottom: 6, fontSize: 13 }}
                    />
                  ))}

                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#27427f', marginTop: 6, marginBottom: 2 }}>DIDACTIC EXPLANATION:</label>
                  <textarea
                    rows={2}
                    value={item.explanation}
                    onChange={(e) => updateQuestion(q, 'explanation', e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>
              ))
            )}

            {!isEditing && answeredCount === totalQuestions && (
              <div style={{ backgroundColor: '#27427f', color: '#ffffff', borderRadius: 10, padding: 14, textAlign: 'center', fontSize: 16, fontWeight: 800, marginTop: 16 }}>
                {isPt ? `Resultado: ${score} de ${totalQuestions} corretas!` : `Score: ${score} / ${totalQuestions}`}
              </div>
            )}
          </div>
        )}

        {/* 4. Homework Section */}
        <div style={{ marginBottom: 18, marginTop: 24 }}>
          <div style={{ backgroundColor: '#27427f', color: '#eaeffa', fontWeight: 700, fontSize: 13, textAlign: 'center', padding: '8px 14px', borderRadius: 10, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            {homeworkTitle}
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: 10, borderBottom: '4px solid #27427f', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: 14.5, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {!isEditing ? (
              data.homework && data.homework.trim().length > 0 ? (
                <div>{data.homework}</div>
              ) : (
                <div style={{ color: '#64748b', fontStyle: 'italic' }}>
                  {isPt ? 'Nenhuma lição de casa registrada.' : 'No homework assigned.'}
                </div>
              )
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#27427f', marginBottom: 6, textTransform: 'uppercase' }}>
                  {homeworkTitle}:
                </label>
                <textarea
                  rows={4}
                  value={editData?.homework || ''}
                  onChange={(e) => setEditData(prev => prev ? { ...prev, homework: e.target.value } : null)}
                  placeholder={isPt ? "• Exemplo de lição..." : "• Homework item..."}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    fontSize: 14,
                    lineHeight: 1.5,
                    resize: 'vertical',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}