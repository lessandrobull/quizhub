import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface BriefingData {
  studentName: string;
  studentId: string;
  date: string;
  diagnosticFocus: string;
  activitiesDone: string[];
  nextTasks: string;
  didacticTip: string;
  behavioralTip: string;
}

export default function BriefingView() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [data, setData] = useState<BriefingData | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Mode State
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
          diagnostic_focus,
          activities_done,
          next_tasks,
          teaching_tip_didactic,
          teaching_tip_behavioral,
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
        const parsed: BriefingData = {
          studentName: sessionInfo?.students?.name || 'Student',
          studentId: sessionInfo?.student_id || '',
          date: sessionInfo?.class_date || '',
          diagnosticFocus: record.diagnostic_focus || '',
          activitiesDone: (record.activities_done as string[]) || [],
          nextTasks: record.next_tasks || '',
          didacticTip: record.teaching_tip_didactic || '',
          behavioralTip: record.teaching_tip_behavioral || ''
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
    setStatusMsg({ text: 'Saving changes to Supabase...', color: '#27427f' });

    try {
      const { error } = await supabase
        .from('teacher_briefings')
        .update({
          diagnostic_focus: editData.diagnosticFocus,
          activities_done: editData.activitiesDone,
          next_tasks: editData.nextTasks,
          teaching_tip_didactic: editData.didacticTip,
          teaching_tip_behavioral: editData.behavioralTip
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

  const isTeacherSelf = data.studentId === 'lessandro-bull';

  return (
    <div style={{ backgroundColor: '#a6b1ca', minHeight: '100vh', padding: '12px 14px 48px', color: '#1e293b' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>

        {/* Editorial Bar */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 10,
          padding: '10px 16px',
          marginBottom: 14,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderBottom: '4px solid #27427f',
          flexWrap: 'wrap',
          gap: 10
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#27427f', textTransform: 'uppercase' }}>
              Editorial Panel:
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginLeft: 6 }}>
              {isEditing ? 'Editing Mode Active' : 'Report View'}
            </span>
          </div>

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
                  backgroundColor: '#27427f',
                  color: '#eaeffa',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                Edit Content
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
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer'
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
                    padding: '6px 14px',
                    borderRadius: 8,
                    fontSize: '0.82rem',
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

        {/* Header Banner */}
        <div style={{
          backgroundColor: '#27427f',
          borderRadius: 18,
          padding: '16px 20px',
          textAlign: 'center',
          marginBottom: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <div style={{ color: '#71c499', fontSize: '1.15rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {isTeacherSelf ? 'TEACHER SELF-ASSESSMENT BRIEFING' : 'TEACHER BRIEFING'}
          </div>
        </div>

        {/* Student & Navigation */}
        <div style={{
          backgroundColor: '#27427f',
          borderRadius: 10,
          padding: '10px 16px',
          marginBottom: 14,
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link
              to={`/quiz/${sessionId}`}
              target="_blank"
              style={{
                backgroundColor: '#ffffff',
                color: '#27427f',
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: '0.82rem',
                fontWeight: 700,
                textDecoration: 'none',
                textTransform: 'uppercase'
              }}
            >
              Quiz
            </Link>
            <Link
              to={`/teacher/dossier/${data.studentId}`}
              target="_blank"
              style={{
                backgroundColor: '#ffffff',
                color: '#27427f',
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: '0.82rem',
                fontWeight: 700,
                textDecoration: 'none',
                textTransform: 'uppercase'
              }}
            >
              Dossier
            </Link>
          </div>
        </div>

        {/* 1. DIAGNOSTIC & CORE FOCUS */}
        <div style={{ backgroundColor: '#27427f', borderRadius: 10, padding: '8px 14px', textAlign: 'center', marginBottom: 8, color: '#eaeffa', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {isTeacherSelf ? 'DIAGNOSTIC & TARGET LEVEL CALIBRATION' : 'DIAGNOSTIC & PRIORITY FOCUS'}
        </div>
        <div style={{ background: '#ffffff', borderRadius: 10, borderBottom: '4px solid #27427f', padding: '16px 20px', marginBottom: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: '0.95rem', lineHeight: 1.6 }}>
          {!isEditing ? (
            data.diagnosticFocus || 'No diagnostic points registered.'
          ) : (
            <textarea
              rows={3}
              value={editData?.diagnosticFocus || ''}
              onChange={(e) => setEditData(prev => prev ? { ...prev, diagnosticFocus: e.target.value } : null)}
              placeholder="e.g., B2 level. Priority: dependent prepositions with motion verbs."
              style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, lineHeight: 1.5, resize: 'vertical', outline: 'none' }}
            />
          )}
        </div>

        {/* 2. ACTIVITIES & CONCEPTS PRACTICED */}
        <div style={{ backgroundColor: '#27427f', borderRadius: 10, padding: '8px 14px', textAlign: 'center', marginBottom: 8, color: '#eaeffa', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          ACTIVITIES & CONCEPTS PRACTICED
        </div>
        <div style={{ background: '#ffffff', borderRadius: 10, borderBottom: '4px solid #27427f', padding: '16px 20px', marginBottom: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: '0.95rem', lineHeight: 1.6 }}>
          {!isEditing ? (
            data.activitiesDone.length > 0 ? (
              <ul style={{ paddingLeft: 20 }}>
                {data.activitiesDone.map((act, i) => (
                  <li key={i} style={{ marginBottom: 8 }}>{act}</li>
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
                    style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13.5 }}
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
                style={{ backgroundColor: '#eaeffa', color: '#27427f', border: 'none', padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}
              >
                + Add Activity
              </button>
            </div>
          )}
        </div>

        {/* 3. AGREED NEXT TASKS */}
        <div style={{ backgroundColor: '#27427f', borderRadius: 10, padding: '8px 14px', textAlign: 'center', marginBottom: 8, color: '#eaeffa', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          AGREED NEXT TASKS & COMMITMENTS
        </div>
        <div style={{ background: '#ffffff', borderRadius: 10, borderBottom: '4px solid #27427f', padding: '16px 20px', marginBottom: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: '0.95rem', lineHeight: 1.6 }}>
          {!isEditing ? (
            data.nextTasks || 'No specific next tasks scheduled.'
          ) : (
            <textarea
              rows={2}
              value={editData?.nextTasks || ''}
              onChange={(e) => setEditData(prev => prev ? { ...prev, nextTasks: e.target.value } : null)}
              placeholder="Agreed tasks or commitments for the next class"
              style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, lineHeight: 1.5, resize: 'vertical', outline: 'none' }}
            />
          )}
        </div>

        {/* 4. PEDAGOGICAL CONDUCT & TIPS */}
        <div style={{ backgroundColor: '#27427f', borderRadius: 10, padding: '8px 14px', textAlign: 'center', marginBottom: 8, color: '#eaeffa', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {isTeacherSelf ? 'PEDAGOGICAL CONDUCT & STUDENT LEVEL ADAPTATION' : 'PEDAGOGICAL CONDUCT & STUDENT HANDLING'}
        </div>
        <div style={{ background: '#ffffff', borderRadius: 10, borderBottom: '4px solid #27427f', padding: '16px 20px', marginBottom: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: '0.95rem', lineHeight: 1.6 }}>
          <div style={{ backgroundColor: '#eaeffa', borderRadius: 8, padding: '14px 18px', marginBottom: 12 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#27427f', marginBottom: 4 }}>
              Didactic Strategy
            </div>
            {!isEditing ? (
              <div>{data.didacticTip || 'Maintain natural communicative flow.'}</div>
            ) : (
              <textarea
                rows={2}
                value={editData?.didacticTip || ''}
                onChange={(e) => setEditData(prev => prev ? { ...prev, didacticTip: e.target.value } : null)}
                style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13.5, resize: 'vertical', outline: 'none' }}
              />
            )}
          </div>

          <div style={{ backgroundColor: '#eaeffa', borderRadius: 8, padding: '14px 18px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#27427f', marginBottom: 4 }}>
              Behavioral & Confidence Handling
            </div>
            {!isEditing ? (
              <div>{data.behavioralTip || 'Reinforce positive structural feedback.'}</div>
            ) : (
              <textarea
                rows={2}
                value={editData?.behavioralTip || ''}
                onChange={(e) => setEditData(prev => prev ? { ...prev, behavioralTip: e.target.value } : null)}
                style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13.5, resize: 'vertical', outline: 'none' }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}