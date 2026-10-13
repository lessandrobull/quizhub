import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface SessionItem {
    id: string;
    class_date: string;
    class_time?: string;
    created_at?: string;
}

function parseSessionDateToTime(dateStr: string, classTime?: string, createdAt?: string): number {
    if (!dateStr) return createdAt ? new Date(createdAt).getTime() : 0;
    const trimmed = dateStr.trim();

    const monthMap: Record<string, number> = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };

    // 1. MMM D (ex: "Oct 6", "Sep 1")
    const mmmDMatch = trimmed.match(/^([a-zA-Z]{3})\s+(\d{1,2})$/i);
    if (mmmDMatch) {
        const mKey = mmmDMatch[1].toLowerCase();
        const mIndex = monthMap[mKey];
        const day = parseInt(mmmDMatch[2], 10);
        if (mIndex !== undefined) {
            let year = new Date().getFullYear();
            if (createdAt) {
                const cYear = new Date(createdAt).getFullYear();
                if (!isNaN(cYear)) year = cYear;
            }
            let hour = 12;
            if (classTime) {
                const hMatch = classTime.match(/(\d{1,2})/);
                if (hMatch) hour = parseInt(hMatch[1], 10);
            }
            return new Date(year, mIndex, day, hour).getTime();
        }
    }

    // 2. DD/MM
    const ddMmMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})$/);
    if (ddMmMatch) {
        const day = parseInt(ddMmMatch[1], 10);
        const month = parseInt(ddMmMatch[2], 10) - 1;
        let year = new Date().getFullYear();
        if (createdAt) {
            const cYear = new Date(createdAt).getFullYear();
            if (!isNaN(cYear)) year = cYear;
        }
        let hour = 12;
        if (classTime) {
            const hMatch = classTime.match(/(\d{1,2})/);
            if (hMatch) hour = parseInt(hMatch[1], 10);
        }
        return new Date(year, month, day, hour).getTime();
    }

    // 3. YYYY-MM-DD
    const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (ymdMatch) {
        return new Date(trimmed).getTime();
    }

    return createdAt ? new Date(createdAt).getTime() : 0;
}

export default function StudentHub() {
    const { studentId } = useParams<{ studentId: string }>();
    const [studentName, setStudentName] = useState<string>('');
    const [sessions, setSessions] = useState<SessionItem[]>([]);
    const [homework, setHomework] = useState<string>('');
    const [isA1, setIsA1] = useState(false);
    const [rollingLevel, setRollingLevel] = useState<string | null>(null);
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

            // 2. Busca sessões que já possuem quiz gerado (incluindo level para verificar idioma)
            const { data: sessionList, error: sessErr } = await supabase
                .from('class_sessions')
                .select(`
                  id,
                  class_date,
                  class_time,
                  created_at,
                  student_quizzes!inner (
                    id,
                    homework,
                    level
                  )
                `)
                .eq('student_id', studentId);

            if (!sessErr && sessionList) {
                // Ordenação cronológica real decrescente
                const sorted = [...(sessionList as any[])].sort((a, b) => {
                    const timeB = parseSessionDateToTime(b.class_date, b.class_time, b.created_at);
                    const timeA = parseSessionDateToTime(a.class_date, a.class_time, a.created_at);
                    return timeB - timeA;
                });

                setSessions(sorted as unknown as SessionItem[]);

                if (sorted.length > 0) {
                    const latestQuizzes = sorted[0].student_quizzes;
                    const latestHomework = Array.isArray(latestQuizzes)
                        ? latestQuizzes[0]?.homework
                        : latestQuizzes?.homework;
                    if (latestHomework) {
                        setHomework(latestHomework);
                    }

                    const latestLevel = Array.isArray(latestQuizzes)
                        ? latestQuizzes[0]?.level
                        : latestQuizzes?.level;
                    setIsA1(Boolean(latestLevel && latestLevel.toUpperCase().includes('A1')));

                    // Calcula a média móvel oficial das últimas 10 aulas do aluno
                    const levelMap: Record<string, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
                    const numToLevel: Record<number, string> = { 1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2', 5: 'C1', 6: 'C2' };
                    const values: number[] = [];

                    sorted.slice(0, 10).forEach((s: any) => {
                        const sq = Array.isArray(s.student_quizzes) ? s.student_quizzes[0] : s.student_quizzes;
                        if (sq?.level) {
                            const match = sq.level.match(/\b([ABC][12])\b/i);
                            if (match) {
                                const code = match[1].toUpperCase();
                                if (levelMap[code]) values.push(levelMap[code]);
                            }
                        }
                    });

                    if (values.length > 0) {
                        const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
                        const clamped = Math.max(1, Math.min(6, avg));
                        const calculatedAvg = numToLevel[clamped] || null;
                        setRollingLevel(calculatedAvg);
                        setIsA1(Boolean(calculatedAvg && calculatedAvg.toUpperCase().includes('A1')));
                    }
                }
            }

            setLoading(false);
        }

        fetchStudentData();
    }, [studentId]);

    if (loading) {
        return (
            <div style={{ backgroundColor: '#acc1d8', minHeight: '100vh', padding: '40px 16px', textAlign: 'center', color: '#27427f', fontWeight: 'bold' }}>
                Carregando quizzes...
            </div>
        );
    }

    if (!studentName) {
        return (
            <div style={{ backgroundColor: '#acc1d8', minHeight: '100vh', padding: '40px 16px', textAlign: 'center', color: '#b91c1c', fontWeight: 'bold' }}>
                Aluno não encontrado.
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#acc1d8', minHeight: '100vh', padding: '24px 16px 48px', color: '#1e293b' }}>
            <div style={{ maxWidth: 680, margin: '0 auto' }}>
                {/* Banner do Aluno - Padronizado com Student Sessions */}
                <div
                    className="student-main-banner"
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
                        .student-banner-title {
                            color: #71c499;
                            font-size: 1.15rem;
                            font-weight: 800;
                            letter-spacing: 0.06em;
                            text-transform: uppercase;
                            white-space: nowrap;
                        }
                        @media (max-width: 640px) {
                            .student-main-banner {
                                padding: 14px 10px !important;
                            }
                            .student-banner-title {
                                font-size: 1rem !important;
                                letter-spacing: 0.02em !important;
                            }
                        }
                    `}</style>
                    <div className="student-banner-title">
                        QUIZHUB
                    </div>
                    <div style={{ color: '#eaeffa', fontSize: '1rem', fontWeight: 700, marginTop: 4 }}>
                        {studentName}{rollingLevel ? ` • ${rollingLevel}` : ''}
                    </div>
                </div>

                {/* Card de Lição de Casa */}
                <div style={{ marginBottom: 20 }}>
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
                        Homework for next class
                    </div>
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: 10,
                        borderBottom: '4px solid #27427f',
                        padding: '16px 20px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                        fontSize: 14.5,
                        lineHeight: 1.6
                    }}>
                        {(() => {
                            const tasks = homework && homework.trim().length > 0
                                ? homework.split('\n').map(t => t.trim()).filter(t => t.length > 0)
                                : [];

                            return (
                                <div>
                                    <div style={{ lineHeight: 1.6, marginBottom: tasks.length > 0 ? 6 : 0 }}>
                                        {isA1
                                            ? '• Conferir a Área de Foco e o Quiz.'
                                            : "• Check Focus Areas and the Quiz."}
                                    </div>
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
                        })()}
                    </div>
                </div>

                {/* Subtítulo Quizzes */}
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
                    QUIZZES
                </div>

                {/* Lista de Aulas e Quizzes (Padronizado com TeacherHub Sessions) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <style>{`
                        .student-session-card {
                            padding: 16px 20px;
                        }
                        .student-session-title {
                            font-size: 1rem;
                        }
                        @media (max-width: 640px) {
                            .student-session-card {
                                padding: 12px 14px !important;
                            }
                            .student-session-title {
                                font-size: 0.92rem !important;
                            }
                        }
                    `}</style>

                    {sessions.length === 0 ? (
                        <div style={{
                            backgroundColor: '#ffffff',
                            padding: 24,
                            borderRadius: 10,
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
                                className="student-session-card"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    backgroundColor: '#ffffff',
                                    borderRadius: 10,
                                    textDecoration: 'none',
                                    color: '#1e293b',
                                    fontWeight: 700,
                                    borderBottom: '4px solid #27427f',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    gap: 8,
                                    transition: 'transform 0.1s ease'
                                }}
                            >
                                <span className="student-session-title">
                                    Quiz • {sess.class_date}
                                </span>
                                <span style={{
                                    backgroundColor: '#71c499',
                                    color: '#27427f',
                                    padding: '6px 12px',
                                    borderRadius: 8,
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0
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