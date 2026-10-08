import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface SessionItem {
    id: string;
    class_date: string;
    class_time?: string;
}

export default function StudentHub() {
    const { studentId } = useParams<{ studentId: string }>();
    const [studentName, setStudentName] = useState<string>('');
    const [sessions, setSessions] = useState<SessionItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStudentData() {
            if (!studentId) return;

            // 1. Busca dados do aluno
            const { data: student, error: studentErr } = await supabase
                .from('students')
                .select('name')
                .eq('id', studentId)
                .single();

            if (studentErr || !student) {
                setLoading(false);
                return;
            }

            setStudentName(student.name);

            // 2. Busca sessões que já possuem quiz gerado
            const { data: sessionList, error: sessErr } = await supabase
                .from('class_sessions')
                .select(`
          id,
          class_date,
          class_time,
          student_quizzes!inner (id)
        `)
                .eq('student_id', studentId)
                .order('created_at', { ascending: false });

            if (!sessErr && sessionList) {
                setSessions(sessionList as unknown as SessionItem[]);
            }

            setLoading(false);
        }

        fetchStudentData();
    }, [studentId]);

    if (loading) {
        return (
            <div style={{ backgroundColor: '#a6b1ca', minHeight: '100vh', padding: '40px 16px', textAlign: 'center', color: '#27427f', fontWeight: 'bold' }}>
                Carregando quizzes...
            </div>
        );
    }

    if (!studentName) {
        return (
            <div style={{ backgroundColor: '#a6b1ca', minHeight: '100vh', padding: '40px 16px', textAlign: 'center', color: '#b91c1c', fontWeight: 'bold' }}>
                Aluno não encontrado.
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#a6b1ca', minHeight: '100vh', padding: '24px 16px 48px', color: '#1e293b' }}>
            <div style={{ maxWidth: 680, margin: '0 auto' }}>
                {/* Banner do Aluno */}
                <header style={{
                    backgroundColor: '#27427f',
                    borderRadius: 18,
                    padding: '20px 16px',
                    textAlign: 'center',
                    marginBottom: 20,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                }}>
                    <h1 style={{ fontSize: 20, fontWeight: 800, color: '#71c499', margin: 0, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                        QUIZHUB
                    </h1>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#eaeffa', marginTop: 6 }}>
                        {studentName}
                    </div>
                </header>

                {/* Lista de Aulas e Quizzes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {sessions.length === 0 ? (
                        <div style={{
                            backgroundColor: '#ffffff',
                            padding: 24,
                            borderRadius: 12,
                            textAlign: 'center',
                            fontWeight: 600,
                            color: '#475569',
                            borderBottom: '4px solid #27427f'
                        }}>
                            Nenhum quiz disponível no momento.
                        </div>
                    ) : (
                        sessions.map((sess) => (
                            <Link
                                key={sess.id}
                                to={`/quiz/${sess.id}`}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    backgroundColor: '#ffffff',
                                    padding: '18px 20px',
                                    borderRadius: 12,
                                    textDecoration: 'none',
                                    color: '#1e293b',
                                    fontWeight: 700,
                                    fontSize: 15,
                                    borderBottom: '4px solid #27427f',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                                    transition: 'transform 0.1s ease'
                                }}
                            >
                                <span>Quiz • {sess.class_date}</span>
                                <span style={{
                                    backgroundColor: '#27427f',
                                    color: '#eaeffa',
                                    padding: '6px 14px',
                                    borderRadius: 8,
                                    fontSize: 13,
                                    fontWeight: 700,
                                    textTransform: 'uppercase'
                                }}>
                                    Open
                                </span>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}