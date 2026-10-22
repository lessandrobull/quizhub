import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import StudentHub from './pages/StudentHub';
import QuizView from './pages/QuizView';
import TeacherHub from './pages/TeacherHub';
import BriefingView from './pages/BriefingView';
import DossierView from './pages/DossierView';
import TeacherGuard from './components/TeacherGuard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/teacher" replace />} />

        {/* Rotas Públicas dos Alunos (Acesso Livre sem Login) */}
        <Route path="/:studentId" element={<StudentHub />} />
        <Route path="/quiz/:sessionId" element={<QuizView />} />

        {/* Rotas Docentes Protegidas por Autenticação */}
        <Route element={<TeacherGuard />}>
          <Route path="/teacher" element={<TeacherHub />} />
          <Route path="/teacher/:studentId" element={<TeacherHub />} />
          <Route path="/teacher/quiz/:sessionId" element={<QuizView />} />
          <Route path="/teacher/briefing/:sessionId" element={<BriefingView />} />
          <Route path="/teacher/dossier/:studentId" element={<DossierView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
