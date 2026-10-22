import { useState, useEffect, type FormEvent } from 'react';
import { Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

export default function TeacherGuard() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setSubmitting(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrorMsg('E-mail ou senha incorretos.');
        } else {
          setErrorMsg(error.message || 'Falha ao autenticar.');
        }
      }
    } catch {
      setErrorMsg('Erro de conexão ao autenticar.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#acc1d8', minHeight: '100vh', padding: 40, textAlign: 'center', color: '#27427f', fontWeight: 'bold' }}>
        Carregando painel docente...
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ backgroundColor: '#acc1d8', minHeight: '100vh', padding: '24px 16px 48px', color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 420, width: '100%' }}>
          <div
            style={{
              backgroundColor: '#27427f',
              borderRadius: 18,
              padding: '16px 20px',
              textAlign: 'center',
              marginBottom: 16,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ color: '#71c499', fontSize: '1.15rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              QUIZHUB • TEACHER ACCESS
            </div>
            <div style={{ color: '#eaeffa', fontSize: '0.85rem', fontWeight: 600, marginTop: 4 }}>
              Acesso exclusivo do professor
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 10,
              padding: '24px 20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              borderBottom: '4px solid #27427f'
            }}
          >
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#27427f', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  E-mail:
                </label>
                <input
                  type="email"
                  autoFocus
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                    color: '#1e293b',
                    backgroundColor: '#eaeffa',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#27427f', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Senha:
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                    color: '#1e293b',
                    backgroundColor: '#eaeffa',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {errorMsg && (
                <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', padding: '8px 12px', borderRadius: 6, fontSize: '0.82rem', fontWeight: 700, textAlign: 'center' }}>
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !email.trim() || !password.trim()}
                style={{
                  backgroundColor: '#27427f',
                  color: '#ffffff',
                  border: 'none',
                  padding: '11px 20px',
                  borderRadius: 8,
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: (submitting || !email.trim() || !password.trim()) ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginTop: 6
                }}
              >
                {submitting ? 'Entrando...' : 'Entrar no Painel'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
