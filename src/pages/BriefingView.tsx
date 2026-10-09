import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface TeacherFocusArea {
  studentSaid: string;
  betterWay: string;
  explanation: string;
}

interface BriefingData {
  studentName: string;
  studentId: string;
  date: string;
  activitiesDone: string[];
  conversationAssessment: string;
  focusAreas: TeacherFocusArea[];
  nextTasks: string;
}

export default function BriefingView() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [data, setData] = useState<BriefingData | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados de Edição Editorial
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<BriefingData | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; color: string } | null>(null);

  useEffect(() => {
    async function fetchBriefing() {
      if (!sessionId) return;
      setLoading(true);

      const { data: record, error } = await supabase
        .from('teacher_briefings')
        .select(`
          activities_done,
          next_tasks,
          conversation_assessment,
          focus_areas,
          diagnostic_focus,
          class_sessions (
            id,
            class_date,
            student_id,
            students (
              name
            )
          )
        `)
        .eq('session_id', sessionId)
        .single();

      if (!error && record) {
        const sessionInfo = record.class_sessions as any;
        const isTeacher = sessionInfo?.student_id === 'lessandro-bull';

        let resolvedStudentName = sessionInfo?.students?.name || 'Student';

        // Para sessões docentes, recupera o nome real do aluno avaliado
        if (isTeacher) {
          const { data: quizRecord } = await supabase
            .from('student_quizzes')
            .select('level')
            .eq('session_id', sessionId)
            .maybeSingle();

          if (quizRecord?.level) {
            const match = quizRecord.level.match(/\(([^)]+)\)/);
            if (match && match[1]) {
              resolvedStudentName = match[1];
            }
          }
        }

        const parsed: BriefingData = {
          studentName: resolvedStudentName,
          studentId: sessionInfo?.student_id || '',
          date: sessionInfo?.class_date || '',
          activitiesDone: (record.activities_done as string[]) || [],
          conversationAssessment: record.conversation_assessment || record.diagnostic_focus || '',
          focusAreas: (record.focus_areas as TeacherFocusArea[]) || [],
          nextTasks: record.next_tasks || ''
        };

        setData(parsed);
        setEditData(JSON.parse(JSON.stringify(parsed)));
      }
      setLoading(false);
    }

    fetchBriefing();
  }, [sessionId]);

  const handleToggleEdit = () => {
    if (!isEditing && data) {
      setEditData(JSON.parse(JSON.stringify(data)));
      setIsEditing(true);
    } else {
      setIsEditing(false);
      setStatusMsg(null);
    }
  };

  const handleSaveChanges = async () => {
    if (!editData || !sessionId) return;
    setSaving(true);
    setStatusMsg({ text: 'Saving changes...', color: '#27427f' });

    try {
      const { error } = await supabase
        .from('teacher_briefings')
        .update({
          activities_done: editData.activitiesDone,
          conversation_assessment: editData.conversationAssessment,
          focus_areas: editData.focusAreas,
          next_tasks: editData.nextTasks
        })
        .eq('session_id', sessionId);

      if (error) throw error;

      setData(JSON.parse(JSON.stringify(editData)));
      setIsEditing(false);
      setStatusMsg({ text: 'Briefing saved successfully.', color: '#15803d' });
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err: any) {
      setStatusMsg({ text: 'Error saving: ' + (err.message || 'Connection failed'), color: '#b91c1c' });
    } finally {
      setSaving(false);
    }
  };

  // Funções de manipulação de Activities
  const updateActivity = (index: number, value: string) => {
    if (!editData) return;
    const updated = [...editData.activitiesDone];
    updated[index] = value;
    setEditData({ ...editData, activitiesDone: updated });
  };

  const addActivity = () => {
    if (!editData) return;
    setEditData({ ...editData, activitiesDone: [...editData.activitiesDone, ''] });
  };

  const removeActivity = (index: number) => {
    if (!editData) return;
    const updated = editData.activitiesDone.filter((_, i) => i !== index);
    setEditData({ ...editData, activitiesDone: updated });
  };

  // Funções de manipulação de Teacher Focus Areas
  const updateFocusArea = (index: number, field: keyof TeacherFocusArea, value: string) => {
    if (!editData) return;
    const updated = [...editData.focusAreas];
    updated[index] = { ...updated[index], [field]: value };
    setEditData({ ...editData, focusAreas: updated });
  };

  const addFocusArea = () => {
    if (!editData) return;
    setEditData({
      ...editData,
      focusAreas: [...editData.focusAreas, { studentSaid: '', betterWay: '', explanation: '' }]
    });
  };

  const removeFocusArea = (index: number) => {
    if (!editData) return;
    const updated = editData.focusAreas.filter((_, i) => i !== index);
    setEditData({ ...editData, focusAreas: updated });
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#a6b1ca', minHeight: '100vh', padding: 40, textAlign: 'center', color: '#27427f', fontWeight: 'bold' }}>
        Loading Briefing...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ backgroundColor: '#a6b1ca', minHeight: '100vh', padding: 40, textAlign: 'center', color: '#b91c1c', fontWeight: 'bold' }}>
        Briefing not found for this session.
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#a6b1ca', minHeight: '100vh', padding: '24px 16px 48px', color: '#1e293b' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>

        {/* 1. Main Banner */}
        <div
          className="briefing-main-banner"
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
            .briefing-banner-title {
              color: #71c499;
              font-size: 1.15rem;
              font-weight: 800;
              letter-spacing: 0.06em;
              text-transform: uppercase;
              white-space: nowrap;
            }
            @media (max-width: 640px) {
              .briefing-main-banner {
                padding: 14px 10px !important;
              }
              .briefing-banner-title {
                font-size: 0.80rem !important;
                letter-spacing: 0.02em !important;
              }
            }
          `}</style>
          <div className="briefing-banner-title">
            PEDAGOGICAL DASHBOARD • BRIEFING
          </div>
        </div>

        {/* 2. Navigation & Editorial Card */}
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
            to={data.studentId ? (data.studentId === 'lessandro-bull' ? '/teacher/lessandro-bull' : `/teacher/${data.studentId}`) : '/teacher'}
            style={{
              color: '#27427f',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.88rem'
            }}
          >
            ← Back to Student Sessions
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

        {/* 3. Session Info Card */}
        <div style={{
          backgroundColor: '#27427f',
          borderRadius: 10,
          padding: '10px 16px',
          marginBottom: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10
        }}>
          <span style={{ color: '#eaeffa', fontSize: '1.05rem', fontWeight: 700 }}>
            {data.studentName} &bull; {data.date}
          </span>
          <div>
            <Link
              to={`/teacher/quiz/${sessionId}`}
              style={{
                backgroundColor: '#71c499',
                color: '#27427f',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: '0.82rem',
                fontWeight: 800,
                textDecoration: 'none',
                textTransform: 'uppercase'
              }}
            >
              QUIZ
            </Link>
          </div>
        </div>

        {/* Section 1: Conversation Assessment (4 Sentences) */}
        <div style={{ backgroundColor: '#27427f', borderRadius: 10, padding: '8px 14px', textAlign: 'center', marginBottom: 8, color: '#eaeffa', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          CONVERSATION ASSESSMENT
        </div>
        <div style={{ background: '#ffffff', borderRadius: 10, borderBottom: '4px solid #27427f', padding: '16px 20px', marginBottom: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: 14.5, lineHeight: 1.6 }}>
          {!isEditing ? (
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {data.conversationAssessment || 'No conversation assessment registered.'}
            </div>
          ) : (
            <textarea
              rows={6}
              value={editData?.conversationAssessment || ''}
              onChange={(e) => setEditData(prev => prev ? { ...prev, conversationAssessment: e.target.value } : null)}
              placeholder="Sentence 1: Hi, Lessandro...&#10;Sentence 2: For a student at level...&#10;Sentence 3: Practical calibrating tips...&#10;Sentence 4: Behavioral & confidence tips..."
              style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid #cbd5e1', backgroundColor: '#eaeffa', fontSize: 14.5, lineHeight: 1.6, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
            />
          )}
        </div>

        {/* Section 2: Activities & Concepts Practiced */}
        <div style={{
          backgroundColor: '#27427f',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: 13,
          textAlign: 'center',
          padding: '8px 14px',
          borderRadius: 10,
          marginBottom: 8,
          textTransform: 'uppercase',
          letterSpacing: '0.6px'
        }}>
          ACTIVITIES & CONCEPTS PRACTICED
        </div>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 10,
          borderBottom: '4px solid #27427f',
          padding: '16px 20px',
          marginBottom: 18,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          fontSize: 14.5,
          lineHeight: 1.6
        }}>
          {!isEditing ? (
            data.activitiesDone.length > 0 ? (
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                {data.activitiesDone.map((act, i) => (
                  <li
                    key={i}
                    style={{
                      marginBottom: i === data.activitiesDone.length - 1 ? 0 : 6,
                      lineHeight: 1.6
                    }}
                  >
                    {act}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#64748b', margin: 0 }}>No activities listed.</p>
            )
          ) : (
            <div>
              {(editData?.activitiesDone || []).map((act, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    type="text"
                    value={act}
                    onChange={(e) => updateActivity(i, e.target.value)}
                    placeholder={`Activity ${i + 1}`}
                    style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', backgroundColor: '#eaeffa', fontSize: '0.92rem', outline: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => removeActivity(i)}
                    style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 6, padding: '0 12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addActivity}
                style={{ backgroundColor: '#eaeffa', color: '#27427f', border: 'none', padding: '6px 14px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', marginTop: 4 }}
              >
                + Add Activity
              </button>
            </div>
          )}
        </div>

        {/* Section 3: Agreed Next Tasks */}
        <div style={{
          backgroundColor: '#27427f',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: 13,
          textAlign: 'center',
          padding: '8px 14px',
          borderRadius: 10,
          marginBottom: 8,
          textTransform: 'uppercase',
          letterSpacing: '0.6px'
        }}>
          AGREED NEXT TASKS
        </div>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 10,
          borderBottom: '4px solid #27427f',
          padding: '16px 20px',
          marginBottom: 18,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          fontSize: 14.5,
          lineHeight: 1.6
        }}>
          {!isEditing ? (
            (() => {
              if (!data.nextTasks || !data.nextTasks.trim()) {
                return <div style={{ color: '#64748b' }}>No specific next tasks scheduled.</div>;
              }
              const tasks = data.nextTasks
                .split('\n')
                .map(t => t.trim())
                .filter(t => t.length > 0);

              return (
                <div>
                  {tasks.map((task, idx) => (
                    <div
                      key={idx}
                      style={{
                        lineHeight: 1.6,
                        marginBottom: idx === tasks.length - 1 ? 0 : 6
                      }}
                    >
                      {task}
                    </div>
                  ))}
                </div>
              );
            })()
          ) : (
            <textarea
              rows={3}
              value={editData?.nextTasks || ''}
              onChange={(e) => setEditData(prev => prev ? { ...prev, nextTasks: e.target.value } : null)}
              placeholder="Agreed tasks or commitments for the next class"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                backgroundColor: '#eaeffa',
                fontSize: 14.5,
                lineHeight: 1.6,
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          )}
        </div>

        {/* Section 4: Teacher Focus Areas (5 Items) */}
        <div style={{ backgroundColor: '#27427f', borderRadius: 10, padding: '8px 14px', textAlign: 'center', marginBottom: 8, color: '#eaeffa', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          TEACHER FOCUS AREAS
        </div>
        <div style={{ marginBottom: 18 }}>
          {!isEditing ? (
            data.focusAreas.length > 0 ? (
              data.focusAreas.map((fa, i) => (
                <div key={i} style={{ backgroundColor: '#ffffff', borderRadius: 10, borderBottom: '4px solid #27427f', padding: '14px 16px', marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <div style={{ color: '#b91c1c', fontWeight: 600, fontSize: '0.95rem', marginBottom: 4 }}>{fa.studentSaid}</div>
                  <div style={{ color: '#0b5394', fontWeight: 700, fontSize: '1rem', marginBottom: 10 }}>{fa.betterWay}</div>
                  <div style={{ backgroundColor: '#eaeffa', borderRadius: 8, padding: '10px 12px', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    <strong style={{ color: '#27427f' }}>Explanation:</strong> {fa.explanation}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ background: '#ffffff', borderRadius: 10, borderBottom: '4px solid #27427f', padding: '16px 20px', color: '#64748b', fontSize: '0.95rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                No teacher focus areas registered.
              </div>
            )
          ) : (
            <div>
              {(editData?.focusAreas || []).map((fa, i) => (
                <div key={i} style={{ backgroundColor: '#ffffff', borderRadius: 10, borderBottom: '4px solid #27427f', padding: '14px 16px', marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#27427f' }}>
                      FOCUS ITEM #{i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFocusArea(i)}
                      style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 6, padding: '2px 8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Delete Item
                    </button>
                  </div>

                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#b91c1c', marginBottom: 2 }}>TEACHER SAID (EXACT PHRASE):</label>
                  <input
                    type="text"
                    value={fa.studentSaid}
                    onChange={(e) => updateFocusArea(i, 'studentSaid', e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', backgroundColor: '#eaeffa', marginBottom: 8, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                  />

                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0b5394', marginBottom: 2 }}>BETTER WAY (CALIBRATED PHRASE):</label>
                  <input
                    type="text"
                    value={fa.betterWay}
                    onChange={(e) => updateFocusArea(i, 'betterWay', e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', backgroundColor: '#eaeffa', marginBottom: 8, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                  />

                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#27427f', marginBottom: 2 }}>CONCISE EXPLANATION:</label>
                  <textarea
                    rows={2}
                    value={fa.explanation}
                    onChange={(e) => updateFocusArea(i, 'explanation', e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', backgroundColor: '#eaeffa', fontSize: '0.9rem', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addFocusArea}
                style={{ backgroundColor: '#ffffff', color: '#27427f', border: '1px solid #27427f', padding: '8px 16px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
              >
                + Add Focus Item
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}