import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface PendingSuggestions {
  personal_data?: string | null;
  routine?: string | null;
  learning_profile?: string | null;
  class_history?: string | null;
}

interface DossierData {
  studentName: string;
  studentId: string;
  personalContext: string;
  routine: string;
  learningProfile: string;
  classHistory: string;
  pendingSuggestions: PendingSuggestions;
}

export default function DossierView() {
  const { studentId } = useParams<{ studentId: string }>();
  const [data, setData] = useState<DossierData | null>(null);
  const [loading, setLoading] = useState(true);

  const [editingKey, setEditingKey] = useState<keyof PendingSuggestions | null>(null);
  const [editedText, setEditedText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; color: string } | null>(null);

  const [brainDumpText, setBrainDumpText] = useState('');
  const [savingDump, setSavingDump] = useState(false);

  useEffect(() => {
    async function fetchDossier() {
      if (!studentId) return;
      setLoading(true);

      const { data: record, error } = await supabase
        .from('dossiers')
        .select(`
          personal_context,
          routine,
          learning_profile,
          class_history,
          pending_suggestions,
          students (
            name
          )
        `)
        .eq('student_id', studentId)
        .single();

      if (!error && record) {
        const studentInfo = record.students as any;
        setData({
          studentName: studentInfo?.name || 'Student',
          studentId: studentId,
          personalContext: record.personal_context || 'No personal data recorded.',
          routine: record.routine || 'No routine data recorded.',
          learningProfile: record.learning_profile || 'No learning profile recorded.',
          classHistory: record.class_history || 'No class history recorded.',
          pendingSuggestions: (record.pending_suggestions as PendingSuggestions) || {}
        });
      }
      setLoading(false);
    }

    fetchDossier();
  }, [studentId]);

  const handleStartEdit = (key: keyof PendingSuggestions, currentSuggestionText: string) => {
    setEditingKey(key);
    setEditedText(currentSuggestionText);
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setEditedText('');
  };

  // Gravação Literal Direta no Supabase
  const handleApproveSuggestion = async (key: keyof PendingSuggestions, textToInsert: string) => {
    if (!data || !studentId || !textToInsert.trim()) return;
    setActionLoading(true);
    setStatusMsg({ text: 'Consolidating into permanent record...', color: '#27427f' });

    try {
      const dbFieldMap: Record<keyof PendingSuggestions, keyof DossierData> = {
        personal_data: 'personalContext',
        routine: 'routine',
        learning_profile: 'learningProfile',
        class_history: 'classHistory'
      };

      const tableColumnMap: Record<keyof PendingSuggestions, string> = {
        personal_data: 'personal_context',
        routine: 'routine',
        learning_profile: 'learning_profile',
        class_history: 'class_history'
      };

      const currentVal = data[dbFieldMap[key]] as string;
      const updatedVal = (currentVal && !currentVal.startsWith('No '))
        ? `${currentVal}\n\n${textToInsert.trim()}`
        : textToInsert.trim();

      const updatedSuggestions = { ...data.pendingSuggestions };
      delete updatedSuggestions[key];

      const { error } = await supabase
        .from('dossiers')
        .update({
          [tableColumnMap[key]]: updatedVal,
          pending_suggestions: updatedSuggestions,
          updated_at: new Date().toISOString()
        })
        .eq('student_id', studentId);

      if (error) throw error;

      setData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          [dbFieldMap[key]]: updatedVal,
          pendingSuggestions: updatedSuggestions
        };
      });

      setEditingKey(null);
      setEditedText('');
      setStatusMsg({ text: 'Entry approved and permanently saved.', color: '#15803d' });
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err: any) {
      setStatusMsg({ text: 'Error saving: ' + (err.message || 'Connection failed'), color: '#b91c1c' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDiscardSuggestion = async (key: keyof PendingSuggestions) => {
    if (!data || !studentId) return;
    setActionLoading(true);

    try {
      const updatedSuggestions = { ...data.pendingSuggestions };
      delete updatedSuggestions[key];

      const { error } = await supabase
        .from('dossiers')
        .update({
          pending_suggestions: updatedSuggestions,
          updated_at: new Date().toISOString()
        })
        .eq('student_id', studentId);

      if (error) throw error;

      setData(prev => prev ? { ...prev, pendingSuggestions: updatedSuggestions } : null);
      if (editingKey === key) {
        setEditingKey(null);
        setEditedText('');
      }
      setStatusMsg({ text: 'Suggestion discarded.', color: '#475569' });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      setStatusMsg({ text: 'Error discarding: ' + (err.message || 'Failed'), color: '#b91c1c' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveBrainDump = async () => {
    if (!brainDumpText.trim() || !studentId || !data) return;
    setSavingDump(true);

    try {
      const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const newEntry = `- Manual Note (${today}): ${brainDumpText.trim()}`;
      const currentHistory = data.classHistory && !data.classHistory.startsWith('No ') ? data.classHistory : '';
      const updatedHistory = currentHistory ? `${currentHistory}\n\n${newEntry}` : newEntry;

      const { error } = await supabase
        .from('dossiers')
        .update({
          class_history: updatedHistory,
          updated_at: new Date().toISOString()
        })
        .eq('student_id', studentId);

      if (error) throw error;

      setData(prev => prev ? { ...prev, classHistory: updatedHistory } : null);
      setBrainDumpText('');
      setStatusMsg({ text: 'Manual note saved to history.', color: '#15803d' });
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err: any) {
      setStatusMsg({ text: 'Error saving note: ' + (err.message || 'Failed'), color: '#b91c1c' });
    } finally {
      setSavingDump(false);
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#a6b1ca', minHeight: '100vh', padding: 40, textAlign: 'center', color: '#27427f', fontWeight: 'bold' }}>
        Loading Dossier...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ backgroundColor: '#a6b1ca', minHeight: '100vh', padding: 40, textAlign: 'center', color: '#b91c1c', fontWeight: 'bold' }}>
        Dossier not found.
      </div>
    );
  }

  const isTeacherSelf = data.studentId === 'lessandro-bull';

  const renderStagingCard = (key: keyof PendingSuggestions) => {
    const suggestionText = data.pendingSuggestions[key];
    if (!suggestionText) return null;

    const isCurrentlyEditing = editingKey === key;

    return (
      <div style={{
        marginTop: 12,
        backgroundColor: '#eaeffa',
        border: '2px dashed #27427f',
        borderRadius: 8,
        padding: '14px 16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#27427f', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            AI Suggestion (Pending Approval):
          </span>
          {statusMsg && (
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: statusMsg.color }}>
              {statusMsg.text}
            </span>
          )}
        </div>

        {!isCurrentlyEditing ? (
          <div style={{ fontSize: '0.92rem', color: '#1e293b', lineHeight: 1.5, marginBottom: 10, whiteSpace: 'pre-wrap' }}>
            {suggestionText}
          </div>
        ) : (
          <textarea
            rows={3}
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              fontSize: '0.92rem',
              lineHeight: 1.5,
              resize: 'vertical',
              outline: 'none',
              marginBottom: 10,
              backgroundColor: '#ffffff'
            }}
          />
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {!isCurrentlyEditing ? (
            <>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleStartEdit(key, suggestionText)}
                style={{
                  backgroundColor: '#27427f',
                  color: '#ffffff',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: 6,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                Edit
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleApproveSuggestion(key, suggestionText)}
                style={{
                  backgroundColor: '#71c499',
                  color: '#27427f',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: 6,
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                Insert
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleDiscardSuggestion(key)}
                style={{
                  backgroundColor: '#fee2e2',
                  color: '#b91c1c',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                Discard
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleCancelEdit}
                style={{
                  backgroundColor: '#cbd5e1',
                  color: '#1e293b',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: actionLoading ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleApproveSuggestion(key, editedText)}
                style={{
                  backgroundColor: '#71c499',
                  color: '#27427f',
                  border: 'none',
                  padding: '6px 16px',
                  borderRadius: 6,
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                Save & Insert
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      backgroundColor: '#a6b1ca',
      minHeight: '100vh',
      padding: '24px 16px 48px',
      color: '#1e293b',
      lineHeight: 1.6
    }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>

        {/* Main Banner */}
        <div style={{
          backgroundColor: '#27427f',
          borderRadius: 18,
          padding: 20,
          textAlign: 'center',
          marginBottom: 14,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <div style={{ color: '#71c499', fontSize: '1.15rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {isTeacherSelf ? 'TEACHER DOSSIER (SELF-ASSESSMENT)' : 'CONFIDENTIAL STUDENT DOSSIER'}
          </div>
          <div style={{ color: '#eaeffa', fontSize: '1.05rem', fontWeight: 700, marginTop: 4 }}>
            {data.studentName}
          </div>
        </div>

        {/* Navigation Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Link
            to={isTeacherSelf ? '/teacher' : `/teacher/${data.studentId}`}
            style={{
              backgroundColor: '#ffffff',
              color: '#27427f',
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: '0.85rem',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
            }}
          >
            {isTeacherSelf ? '← Back to Overview' : '← Back to Classes'}
          </Link>
        </div>

        {/* 1. PERSONAL DATA */}
        <div style={{
          backgroundColor: '#27427f',
          borderRadius: 10,
          padding: '8px 14px',
          textAlign: 'center',
          marginBottom: 8,
          color: '#eaeffa',
          fontWeight: 700,
          fontSize: '0.88rem',
          letterSpacing: '0.06em',
          textTransform: 'uppercase'
        }}>
          1. PERSONAL DATA & CONTEXT
        </div>
        <div style={{
          background: '#ffffff',
          borderRadius: 10,
          borderBottom: '4px solid #27427f',
          padding: '16px 20px',
          marginBottom: 18,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          fontSize: '0.95rem',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          <div>{data.personalContext}</div>
          {renderStagingCard('personal_data')}
        </div>

        {/* 2. ROUTINE */}
        <div style={{
          backgroundColor: '#27427f',
          borderRadius: 10,
          padding: '8px 14px',
          textAlign: 'center',
          marginBottom: 8,
          color: '#eaeffa',
          fontWeight: 700,
          fontSize: '0.88rem',
          letterSpacing: '0.06em',
          textTransform: 'uppercase'
        }}>
          2. ROUTINE & DAILY CONTEXT
        </div>
        <div style={{
          background: '#ffffff',
          borderRadius: 10,
          borderBottom: '4px solid #27427f',
          padding: '16px 20px',
          marginBottom: 18,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          fontSize: '0.95rem',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          <div>{data.routine}</div>
          {renderStagingCard('routine')}
        </div>

        {/* 3. LEARNING PROFILE */}
        <div style={{
          backgroundColor: '#27427f',
          borderRadius: 10,
          padding: '8px 14px',
          textAlign: 'center',
          marginBottom: 8,
          color: '#eaeffa',
          fontWeight: 700,
          fontSize: '0.88rem',
          letterSpacing: '0.06em',
          textTransform: 'uppercase'
        }}>
          {isTeacherSelf ? '3. TUTOR PROFILE & CONDUCT' : '3. LEARNING PROFILE & CONDUCT'}
        </div>
        <div style={{
          background: '#ffffff',
          borderRadius: 10,
          borderBottom: '4px solid #27427f',
          padding: '16px 20px',
          marginBottom: 18,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          fontSize: '0.95rem',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          <div>{data.learningProfile}</div>
          {renderStagingCard('learning_profile')}
        </div>

        {/* 4. CLASS HISTORY */}
        <div style={{
          backgroundColor: '#27427f',
          borderRadius: 10,
          padding: '8px 14px',
          textAlign: 'center',
          marginBottom: 8,
          color: '#eaeffa',
          fontWeight: 700,
          fontSize: '0.88rem',
          letterSpacing: '0.06em',
          textTransform: 'uppercase'
        }}>
          {isTeacherSelf ? '4. CUMULATIVE TEACHING HISTORY' : '4. CUMULATIVE CLASS HISTORY'}
        </div>
        <div style={{
          background: '#ffffff',
          borderRadius: 10,
          borderBottom: '4px solid #27427f',
          padding: '16px 20px',
          marginBottom: 18,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          fontSize: '0.95rem',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          <div>{data.classHistory}</div>
          {renderStagingCard('class_history')}
        </div>

        {/* 5. BRAIN DUMP */}
        <div style={{
          backgroundColor: '#27427f',
          borderRadius: 10,
          padding: '8px 14px',
          textAlign: 'center',
          marginBottom: 8,
          color: '#eaeffa',
          fontWeight: 700,
          fontSize: '0.88rem',
          letterSpacing: '0.06em',
          textTransform: 'uppercase'
        }}>
          BRAIN DUMP • TEACHER MANUAL NOTES
        </div>
        <div style={{
          background: '#ffffff',
          borderRadius: 10,
          borderBottom: '4px solid #27427f',
          padding: '16px 20px',
          marginBottom: 18,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <p style={{ fontSize: '0.88rem', color: '#475569', margin: '0 0 10px 0', lineHeight: 1.4 }}>
            Type free observations, quick reminders, or updates. The note will be permanently appended to the history with today's date.
          </p>
          <textarea
            value={brainDumpText}
            onChange={(e) => setBrainDumpText(e.target.value)}
            placeholder="e.g., Student mentioned a trip next week; reinforce structures with travel vocabulary..."
            style={{
              width: '100%',
              minHeight: 100,
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              padding: 12,
              fontSize: '0.95rem',
              color: '#1e293b',
              resize: 'vertical',
              backgroundColor: '#eaeffa',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <button
              type="button"
              disabled={savingDump || !brainDumpText.trim()}
              onClick={handleSaveBrainDump}
              style={{
                backgroundColor: (savingDump || !brainDumpText.trim()) ? '#94a3b8' : '#27427f',
                color: '#ffffff',
                border: 'none',
                padding: '10px 22px',
                borderRadius: 8,
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: (savingDump || !brainDumpText.trim()) ? 'not-allowed' : 'pointer'
              }}
            >
              {savingDump ? 'Saving...' : 'Save to History'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}