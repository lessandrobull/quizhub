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
function formatSessionDate(dateStr: string): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  if (/^\d{2}\/\d{2}$/.test(trimmed)) return trimmed;

  const monthMap: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
  };

  const mmmDMatch = trimmed.match(/^([a-zA-Z]{3})\s+(\d{1,2})$/);
  if (mmmDMatch) {
    const monthKey = mmmDMatch[1].toLowerCase();
    const monthNum = monthMap[monthKey];
    if (monthNum) {
      const dayNum = mmmDMatch[2].padStart(2, '0');
      return `${dayNum}/${monthNum}`;
    }
  }

  const ymdMatch = trimmed.match(/^\d{4}-(\d{2})-(\d{2})$/);
  if (ymdMatch) {
    return `${ymdMatch[2]}/${ymdMatch[1]}`;
  }

  return trimmed;
}

function getStudentDisplayName(fullName: string, allNames: string[]): string {
  if (!fullName) return '';
  const clean = fullName.trim();
  const parts = clean.split(/\s+/);
  const firstName = parts[0];
  if (parts.length === 1) return firstName;

  const hasDuplicateFirst = allNames.some(name => {
    const otherClean = name.trim();
    if (otherClean.toLowerCase() === clean.toLowerCase()) return false;
    const otherFirst = otherClean.split(/\s+/)[0];
    return otherFirst.toLowerCase() === firstName.toLowerCase();
  });

  if (hasDuplicateFirst) {
    const lastName = parts[parts.length - 1];
    return `${firstName} ${lastName.charAt(0).toUpperCase()}.`;
  }

  return firstName;
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
        <div
          className="teacher-main-banner"
          style={{
            backgroundColor: '#27427f',
            borderRadius: 18,
            padding: '16px 20px',
            textAlign: 'center',
            marginBottom: 16,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}
        >
          <style>{`
            .teacher-banner-title {
              color: #71c499;
              font-size: 1.15rem;
              font-weight: 800;
              letter-spacing: 0.06em;
              text-transform: uppercase;
              white-space: nowrap;
            }
            @media (max-width: 640px) {
              .teacher-main-banner {
                padding: 14px 10px !important;
              }
              .teacher-banner-title {
                font-size: 0.80rem !important;
                letter-spacing: 0.02em !important;
              }
            }
          `}</style>
          <div className="teacher-banner-title">
            {!studentId
              ? 'PEDAGOGICAL DASHBOARD • QUIZHUB'
              : (isTeacherView ? 'PEDAGOGICAL DASHBOARD • ALL SESSIONS' : 'PEDAGOGICAL DASHBOARD • STUDENT SESSIONS')}
          </div>
          {currentStudent && !isTeacherView && (
            <div style={{ color: '#eaeffa', fontSize: '1rem', fontWeight: 700, marginTop: 4 }}>
              {currentStudent.name}
            </div>
          )}
        </div>

        {/* OVERVIEW MODE */}
        {!studentId && (
          <div>
            {/* Teacher Self-Assessment Block */}
            <div
              className="teacher-area-card"
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 12,
                padding: '16px 20px',
                marginBottom: 16,
                boxShadow: '0 4px 12px rgba(39, 66, 127, 0.15)',
                borderBottom: '4px solid #27427f',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12
              }}
            >
              <style>{`
                .teacher-area-left {
                  display: flex;
                  align-items: center;
                  gap: 10px;
                  flex-wrap: wrap;
                }
                .teacher-area-tag {
                  font-size: 0.78rem;
                  font-weight: 800;
                  color: #27427f;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                  line-height: 1;
                  position: relative;
                  top: 1px; /* <-- AJUSTE DE ALTURA NO PC: altere o número aqui (-1px, -2px, etc.) */
                }
                .teacher-area-sub {
                  font-size: 1.05rem;
                  font-weight: 800;
                  color: #1e293b;
                  line-height: 1.2;
                }
                @media (max-width: 640px) {
                  .teacher-area-card {
                    padding: 12px 14px !important;
                    gap: 8px !important;
                  }
                  .teacher-area-left {
                    flex-direction: column !important;
                    align-items: flex-start !important;
                    gap: 2px !important;
                  }
                  .teacher-area-tag {
                    top: 0 !important; /* Neutro no celular */
                  }
                  .teacher-area-sub {
                    font-size: 0.82rem !important;
                  }
                }
              `}</style>
              <div className="teacher-area-left">
                <span className="teacher-area-tag">
                  TEACHER AREA
                </span>
                <span className="teacher-area-sub">
                  Pedagogical Self-Assessment
                </span>
              </div>

              <div style={{ flexShrink: 0 }}>
                <Link
                  to="/teacher/lessandro-bull"
                  style={{
                    backgroundColor: '#27427f',
                    color: '#eaeffa',
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontSize: '0.80rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    whiteSpace: 'nowrap'
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
              padding: '14px 12px',
              marginBottom: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              borderBottom: '4px solid #27427f'
            }}>
              <style>{`
                .process-form {
                  display: flex;
                  gap: 10px;
                  flex-wrap: wrap;
                  align-items: center;
                }
                .process-student-input {
                  flex: 1 1 200px;
                  padding: 8px 12px;
                  border-radius: 8px;
                  border: 1px solid #cbd5e1;
                  font-size: 0.88rem;
                  font-weight: 600;
                  color: #1e293b;
                  background-color: #eaeffa;
                  outline: none;
                }
                .process-date-input {
                  flex: 1 1 160px;
                  padding: 8px 12px;
                  border-radius: 8px;
                  border: 1px solid #cbd5e1;
                  font-size: 0.88rem;
                  font-weight: 600;
                  color: #1e293b;
                  background-color: #eaeffa;
                  outline: none;
                }
                .process-btn-desktop {
                  display: inline;
                }
                .process-btn-mobile {
                  display: none;
                }
                @media (max-width: 640px) {
                  .process-form {
                    flex-wrap: nowrap !important;
                    gap: 6px !important;
                  }
                  .process-student-input {
                    flex: 1 1 0% !important;
                    min-width: 0 !important;
                    padding: 8px 6px !important;
                    font-size: 0.78rem !important;
                  }
                  .process-date-input {
                    flex: 0 0 94px !important;
                    width: 94px !important;
                    padding: 8px 4px !important;
                    font-size: 0.74rem !important;
                  }
                  .process-submit-btn {
                    padding: 8px 10px !important;
                    font-size: 0.75rem !important;
                  }
                  .process-btn-desktop {
                    display: none !important;
                  }
                  .process-btn-mobile {
                    display: inline !important;
                  }
                }
              `}</style>
              <form onSubmit={handleProcessSingleClass} className="process-form">
                <input
                  list="registered-students-list"
                  type="text"
                  placeholder="Select or type student..."
                  value={selectedStudentName}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setSelectedStudentName(e.target.value)}
                  className="process-student-input"
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
                  className="process-date-input"
                />

                <button
                  type="submit"
                  disabled={triggering || !selectedStudentName || !selectedDate}
                  className="process-submit-btn"
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
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {triggering ? '...' : (
                    <>
                      <span className="process-btn-desktop">Process This Class Only</span>
                      <span className="process-btn-mobile">Process</span>
                    </>
                  )}
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
            <div
              className="student-nav-card"
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 10,
                padding: '12px 18px',
                marginBottom: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                borderBottom: '4px solid #27427f'
              }}
            >
              <style>{`
                .student-nav-card {
                  flex-wrap: wrap;
                  gap: 10px;
                }
                .student-nav-back {
                  color: #27427f;
                  text-decoration: none;
                  font-weight: 700;
                  font-size: 0.88rem;
                  white-space: nowrap;
                }
                .student-nav-actions {
                  display: flex;
                  gap: 8px;
                  flex-shrink: 0;
                }
                .student-nav-btn-dossier {
                  background-color: #27427f;
                  color: #eaeffa;
                  padding: 8px 16px;
                  border-radius: 8px;
                  font-size: 0.85rem;
                  font-weight: 700;
                  text-decoration: none;
                  text-transform: uppercase;
                  white-space: nowrap;
                }
                .student-nav-btn-hub {
                  background-color: #71c499;
                  color: #27427f;
                  padding: 8px 16px;
                  border-radius: 8px;
                  font-size: 0.85rem;
                  font-weight: 800;
                  text-decoration: none;
                  text-transform: uppercase;
                  white-space: nowrap;
                }
                @media (max-width: 640px) {
                  .student-nav-card {
                    padding: 10px 8px !important;
                    flex-wrap: nowrap !important;
                    gap: 6px !important;
                  }
                  .student-nav-back {
                    font-size: 0.72rem !important;
                  }
                  .student-nav-actions {
                    gap: 4px !important;
                  }
                  .student-nav-btn-dossier {
                    padding: 6px 8px !important;
                    font-size: 0.70rem !important;
                  }
                  .student-nav-btn-hub {
                    padding: 6px 8px !important;
                    font-size: 0.70rem !important;
                  }
                }
              `}</style>
              <Link
                to="/teacher"
                className="student-nav-back"
              >
                &larr; Back to Overview
              </Link>

              <div className="student-nav-actions">
                <Link
                  to={`/teacher/dossier/${studentId}`}
                  className="student-nav-btn-dossier"
                >
                  {isTeacherView ? 'T-DOSSIER' : 'S-DOSSIER'}
                </Link>
                {!isTeacherView && (
                  <Link
                    to={`/${studentId}`}
                    target="_blank"
                    className="student-nav-btn-hub"
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <style>{`
                  .session-card {
                    padding: 16px 20px;
                  }
                  .session-title-desktop {
                    display: inline;
                  }
                  .session-title-mobile {
                    display: none;
                  }
                  @media (max-width: 640px) {
                    .session-card {
                      padding: 12px 14px 12px 8px !important;
                    }
                    .session-title-desktop {
                      display: none !important;
                    }
                    .session-title-mobile {
                      display: inline !important;
                    }
                  }
                `}</style>
                {sessions.map((sess) => {
                  let desktopStudentLabel = '';
                  let mobileStudentLabel = '';

                  if (isTeacherView) {
                    let rawStudentName = (sess as any).students?.name || '';
                    if (!rawStudentName && sess.student_quizzes && sess.student_quizzes.length > 0) {
                      const lvl = sess.student_quizzes[0].level || '';
                      const match = lvl.match(/\(([^)]+)\)/);
                      if (match) rawStudentName = match[1];
                    }
                    if (rawStudentName) {
                      desktopStudentLabel = ` • ${rawStudentName}`;
                      const allNames = students.map(s => s.name);
                      const shortName = getStudentDisplayName(rawStudentName, allNames);
                      if (shortName) {
                        mobileStudentLabel = ` ${shortName}`;
                      }
                    }
                  }

                  const desktopTimeDisplay = sess.class_time ? ` at ${sess.class_time}` : '';
                  const mobileTimeDisplay = sess.class_time ? ` ${sess.class_time}` : '';
                  const formattedDate = formatSessionDate(sess.class_date);
                  const isVerified = Boolean(sess.is_verified);

                  return (
                    <div
                      key={sess.id}
                      className="session-card"
                      style={{
                        background: '#ffffff',
                        borderRadius: 10,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        borderBottom: '4px solid #27427f',
                        gap: 8
                      }}
                    >
                      {/* Lado Esquerdo: ok / x e Título Responsivo */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
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

                        {/* Versão Desktop (PC) */}
                        <strong className="session-title-desktop" style={{ fontSize: '1rem', color: '#1e293b' }}>
                          Session: {sess.class_date}{desktopTimeDisplay}{desktopStudentLabel}
                        </strong>

                        {/* Versão Mobile (Celular) */}
                        <span className="session-title-mobile" style={{
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          color: '#1e293b',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {formattedDate}{mobileTimeDisplay}{mobileStudentLabel}
                        </span>
                      </div>

                      {/* Lado Direito: Ações */}
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <Link
                          to={`/teacher/briefing/${sess.id}`}
                          style={{
                            backgroundColor: '#27427f',
                            color: '#eaeffa',
                            padding: '6px 12px',
                            borderRadius: 8,
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            textTransform: 'uppercase',
                            whiteSpace: 'nowrap'
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
                            padding: '6px 12px',
                            borderRadius: 8,
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            textTransform: 'uppercase',
                            whiteSpace: 'nowrap'
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
