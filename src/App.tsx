import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import StudentHub from './pages/StudentHub';
import QuizView from './pages/QuizView';
import TeacherHub from './pages/TeacherHub';
import BriefingView from './pages/BriefingView';
import DossierView from './pages/DossierView';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/teacher" replace />} />
        <Route path="/:studentId" element={<StudentHub />} />
        <Route path="/quiz/:sessionId" element={<QuizView />} />
        <Route path="/teacher" element={<TeacherHub />} />
        <Route path="/teacher/:studentId" element={<TeacherHub />} />
        <Route path="/teacher/briefing/:sessionId" element={<BriefingView />} />
        <Route path="/teacher/dossier/:studentId" element={<DossierView />} />
      </Routes>
    </BrowserRouter>
  );
}