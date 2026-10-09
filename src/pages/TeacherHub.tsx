import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Substitua pela URL da sua implantação Web App do Apps Script
const APPS_SCRIPT_TRIGGER_URL = "https://script.google.com/macros/s/AKfycbwYMojtkvPqteY6ZNvnmqqqxA8gmKvsoC7HLyHWAQvjqkOawTq9X4kcFKilHmdhu9c/exec";

interface Student {
  id: string;
  name: string;
}

interface ClassSessionItem {
  id: string;
  class_date: string;
  class_time?: string;
  created_at: string;
  is_verified?: boolean;
  student_quizzes?: { level: string }[];
}

export default function TeacherHub() {
  const { studentId } = useParams<{ studentId: string }>();
  const [students, setStudents] = useState<Student[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [sessions, setSessions] = useState<ClassSessionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados do Disparo Pontual
  const [selectedStudentName, setSelectedStudentName] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [triggering, setTriggering] = useState(false);
  const [triggerMsg, setTriggerMsg] = useState<{ text: string; color: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const { data: studentsList } = await supabase
          .from('students')
          .select('id, name')
          .order('name');

        if (studentsList) {
          setStudents(studentsList);
          const firstRegular = studentsList.find(s => s.id !== 'lessandro-bull');
          if (firstRegular && !selectedStudentName) {
            setSelectedStudentName(firstRegular.name);
          }
        }

        if (studentId) {
          const found = studentsList?.find(s => s.id === studentId);
          setCurrentStudent(found || null);

          let query = supabase
            .from('class_sessions')
            .select(`
              id,
              class_date,
              class_time,
              is_verified,
              created_at,
              students(name),
              student_quizzes(level),
              teacher_briefings!inner(id)
            `);

          if (studentId !== 'lessandro-bull') {
            query = query.eq('student_id', studentId);
          }

          const { data: sessionList } = await query
            .order('created_at', { ascending: false });

          if (sessionList) {
            setSessions(sessionList as unknown as ClassSessionItem[]);
          }
        } else {
          setCurrentStudent(null);
          setSessions([]);
        }
      } catch (err) {
        console.error("Error loading TeacherHub:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [studentId]);

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await supabase.from('student_quizzes').delete().eq('session_id', sessionId);
      await supabase.from('teacher_briefings').delete().eq('session_id', sessionId);
      const { error } = await supabase.from('class_sessions').delete().eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err: any) {
      alert('Error deleting session: ' + (err.message || 'Failed'));
    }
  };

  const handleVerifySession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('class_sessions')
        .update({ is_verified: true })
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, is_verified: true } : s));
    } catch (err: any) {
      alert('Error verifying session: ' + (err.message || 'Failed'));
    }
  };

  // Disparo pontual por aluno e data com contagem sincronizada
  const handleProcessSingleClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentName || !selectedDate) {
      setTriggerMsg({ text: 'Please select both student and class date.', color: '#b91c1c' });
      return;
    }

    // Converte YYYY-MM-DD para "MMM D" (ex: "Sep 30")
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const parts = selectedDate.split('-');
    const formattedDate = (parts.length === 3)
      ? `${months[parseInt(parts[1], 10) - 1]} ${parseInt(parts[2], 10)}`
      : selectedDate;

    setTriggering(true);

    try {
      const url = `${APPS_SCRIPT_TRIGGER_URL}?action=processSingle&studentName=${encodeURIComponent(selectedStudentName)}&targetDate=${encodeURIComponent(formattedDate)}`;
      await fetch(url, { mode: 'no-cors' });

      let secondsLeft = 65;
      setTriggerMsg({
        text: `Processing ${selectedStudentName} (${formattedDate}) with Gemini 3.5... updating in ${secondsLeft}s`,
        color: '#27427f'
      });

      const interval = setInterval(() => {
        secondsLeft -= 1;
        if (secondsLeft > 0) {
          setTriggerMsg({
            text: `Processing ${selectedStudentName} (${formattedDate}) with Gemini 3.5... updating in ${secondsLeft}s`,
            color: '#27427f'
          });
        } else {
          clearInterval(interval);
          setTriggerMsg({ text: 'Session processed! Reloading dashboard...', color: '#15803d' });
          window.location.reload();
        }
      }, 1000);

    } catch (err: any) {
      setTriggerMsg({ text: 'Signal sent. Verify class list in a few moments.', color: '#475569' });
      setTriggering(false);
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#a6b1ca', minHeight: '100vh', padding: 40, textAlign: 'center', color: '#27427f', fontWeight: 'bold' }}>
        Loading pedagogical dashboard...
      </div>
    );
  }

  const regularStudents = students.filter(s => s.id !== 'lessandro-bull');
  const isTeacherView = currentStudent?.id === 'lessandro-bull';

  return (
    <div style={{
      backgroundColor: '#a6b1ca',
      minHeight: '100vh',
      padding: '24px 16px 48px',
      color: '#1e293b'
    }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>

        {/* Main Banner */}
        <div style={{
          backgroundColor: '#27427f',
          borderRadius: 18,
          padding: '16px 20px',
          textAlign: 'center',
          marginBottom: 16,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <div style={{ color: '#71c499', fontSize: '1.15rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {!studentId
              ? 'PEDAGOGICAL DASHBOARD • QUIZHUB'
              : (isTeacherView ? 'PEDAGOGICAL DASHBOARD • ALL SESSIONS' : 'PEDAGOGICAL DASHBOARD • STUDENT SESSIONS')}
          </div>
          {currentStudent && !isTeacherView && (
            <div style={{ color: '#eaeffa', fontSize: '1rem', fontWeight: 700, marginTop: 4 }}>
              Student: {currentStudent.name}
            </div>
          )}
        </div>

        {/* OVERVIEW MODE */}
        {!studentId && (
          <div>
            {/* Teacher Self-Assessment Block */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: '16px 20px',
              marginBottom: 16,
              boxShadow: '0 4px 12px rgba(39, 66, 127, 0.15)',
              borderBottom: '4px solid #27427f',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#27427f', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1, transform: 'translateY(1px)' }}>
                  TEACHER AREA
                </span>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>
                  Pedagogical Self-Assessment
                </span>
              </div>

              <div>
                <Link
                  to="/teacher/lessandro-bull"
                  style={{
                    backgroundColor: '#27427f',
                    color: '#eaeffa',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    textTransform: 'uppercase'
                  }}
                >
                  ALL SESSIONS
                </Link>
              </div>
            </div>

            {/* PAINEL DE DISPARO DIRECIONADO (ALUNO + DATA) */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: 10,
              padding: '14px 18px',
              marginBottom: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              borderBottom: '4px solid #27427f'
            }}>
              <form onSubmit={handleProcessSingleClass} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  list="registered-students-list"
                  type="text"
                  placeholder="Select or type student..."
                  value={selectedStudentName}
                  onChange={(e) => setSelectedStudentName(e.target.value)}
                  style={{
                    flex: '1 1 200px',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: '#1e293b',
                    backgroundColor: '#eaeffa',
                    outline: 'none'
                  }}
                />
                <datalist id="registered-students-list">
                  {regularStudents.map(s => (
                    <option key={s.id} value={s.name} />
                  ))}
                </datalist>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{
                    flex: '1 1 160px',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: '#1e293b',
                    backgroundColor: '#eaeffa',
                    outline: 'none'
                  }}
                />

                <button
                  type="submit"
                  disabled={triggering || !selectedStudentName || !selectedDate}
                  style={{
                    backgroundColor: '#27427f',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 18px',
                    borderRadius: 8,
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: (triggering || !selectedStudentName || !selectedDate) ? 'not-allowed' : 'pointer',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {triggering ? 'Processing...' : 'Process This Class Only'}
                </button>
              </form>

              {triggerMsg && (
                <div style={{ marginTop: 10, fontSize: '0.82rem', fontWeight: 700, color: triggerMsg.color }}>
                  {triggerMsg.text}
                </div>
              )}
            </div>

            {/* Student Selector */}
            <div style={{
              backgroundColor: '#27427f',
              borderRadius: 10,
              padding: '8px 14px',
              textAlign: 'center',
              marginBottom: 14,
              color: '#eaeffa',
              fontWeight: 700,
              fontSize: '0.88rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase'
            }}>
              STUDENTS
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {regularStudents.length === 0 ? (
                <div style={{ background: '#ffffff', borderRadius: 10, padding: 20, textAlign: 'center', color: '#64748b' }}>
                  No active students found in the database.
                </div>
              ) : (
                regularStudents.map((student) => (
                  <Link
                    key={student.id}
                    to={`/teacher/${student.id}`}
                    style={{
                      backgroundColor: '#ffffff',
                      padding: '16px 20px',
                      borderRadius: 10,
                      textDecoration: 'none',
                      color: '#27427f',
                      fontWeight: 700,
                      fontSize: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      borderBottom: '4px solid #27427f'
                    }}
                  >
                    <span>{student.name}</span>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>View Classes</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}

        {/* SPECIFIC STUDENT / TEACHER SESSIONS */}
        {studentId && (
          <div>
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
                to="/teacher"
                style={{
                  color: '#27427f',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.88rem'
                }}
              >
                &larr; Back to Overview
              </Link>

              <div style={{ display: 'flex', gap: 8 }}>
                <Link
                  to={`/teacher/dossier/${studentId}`}
                  style={{
                    backgroundColor: '#27427f',
                    color: '#eaeffa',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    textTransform: 'uppercase'
                  }}
                >
                  {isTeacherView ? 'T-DOSSIER' : 'S-DOSSIER'}
                </Link>
                {!isTeacherView && (
                  <Link
                    to={`/${studentId}`}
                    target="_blank"
                    style={{
                      backgroundColor: '#71c499',
                      color: '#27427f',
                      padding: '8px 16px',
                      borderRadius: 8,
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      textDecoration: 'none',
                      textTransform: 'uppercase'
                    }}
                  >
                    STUDENT HUB
                  </Link>
                )}
              </div>
            </div>

            <div style={{
              backgroundColor: '#27427f',
              borderRadius: 10,
              padding: '8px 14px',
              textAlign: 'center',
              marginBottom: 12,
              color: '#eaeffa',
              fontWeight: 700,
              fontSize: '0.88rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase'
            }}>
              {isTeacherView ? 'ALL SESSIONS' : 'CLASS HISTORY & BRIEFINGS'}
            </div>

            {sessions.length === 0 ? (
              <div style={{
                background: '#ffffff',
                borderRadius: 10,
                padding: 24,
                textAlign: 'center',
                color: '#64748b',
                fontWeight: 600,
                borderBottom: '4px solid #27427f'
              }}>
                No sessions registered yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sessions.map((sess) => {
                  let targetStudentLabel = '';
                  if (isTeacherView) {
                    const studentName = (sess as any).students?.name;
                    if (studentName) {
                      targetStudentLabel = ` • ${studentName}`;
                    } else if (sess.student_quizzes && sess.student_quizzes.length > 0) {
                      const lvl = sess.student_quizzes[0].level || '';
                      const match = lvl.match(/\(([^)]+)\)/);
                      if (match) targetStudentLabel = ` • ${match[1]}`;
                    }
                  }

                  const timeDisplay = sess.class_time ? ` at ${sess.class_time}` : '';
                  const isVerified = Boolean(sess.is_verified);

                  return (
                    <div
                      key={sess.id}
                      style={{
                        background: '#ffffff',
                        borderRadius: 10,
                        padding: '16px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        borderBottom: '4px solid #27427f',
                        flexWrap: 'wrap',
                        gap: 10
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {/* Botões Camuflados no Card: fundo branco #ffffff, texto #a6b1ca */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button
                            type="button"
                            disabled={isVerified}
                            onClick={() => handleVerifySession(sess.id)}
                            title={isVerified ? "Audited and locked" : "Mark as audited and lock"}
                            style={{
                              backgroundColor: '#ffffff',
                              color: isVerified ? '#71c499' : '#a6b1ca',
                              border: 'none',
                              padding: '2px 4px',
                              borderRadius: 4,
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              cursor: isVerified ? 'default' : 'pointer',
                              opacity: isVerified ? 1 : 0.85,
                              textTransform: 'lowercase',
                              outline: 'none'
                            }}
                          >
                            ok
                          </button>

                          {!isVerified && (
                            <button
                              type="button"
                              onClick={() => handleDeleteSession(sess.id)}
                              title="Delete class session completely"
                              style={{
                                backgroundColor: '#ffffff',
                                color: '#a6b1ca',
                                border: 'none',
                                padding: '2px 4px',
                                borderRadius: 4,
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                opacity: 0.85,
                                textTransform: 'lowercase',
                                outline: 'none'
                              }}
                            >
                              x
                            </button>
                          )}
                        </div>

                        {/* Título da Sessão */}
                        <strong style={{ fontSize: '1rem', color: '#1e293b' }}>
                          Session: {sess.class_date}{timeDisplay}{targetStudentLabel}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link
                          to={`/teacher/briefing/${sess.id}`}
                          style={{
                            backgroundColor: '#27427f',
                            color: '#eaeffa',
                            padding: '6px 14px',
                            borderRadius: 8,
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            textTransform: 'uppercase'
                          }}
                        >
                          BRIEFING
                        </Link>
                        <Link
                          to={`/quiz/${sess.id}`}
                          target="_blank"
                          style={{
                            backgroundColor: '#71c499',
                            color: '#27427f',
                            padding: '6px 14px',
                            borderRadius: 8,
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            textTransform: 'uppercase'
                          }}
                        >
                          QUIZ
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
