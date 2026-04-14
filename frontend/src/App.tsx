import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/auth/Login';
import { ActivateAccount } from './pages/auth/ActivateAccount';
import { TwoFactorSetup } from './pages/auth/TwoFactorSetup';
import { Settings } from './pages/settings/Settings';
import { NotesMain } from './pages/notes/NotesMain';
import { FlashcardsMain } from './pages/notes/FlashcardsMain';
import { WorkoutMain } from './pages/workout/WorkoutMain';
import { TasksMain } from './pages/tasks/TasksMain';
import { SocialMain } from './pages/social/SocialMain';
// Prosty element zabezpieczający trasowanie (wymagany LocalStorage Token)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/activate/:token" element={<ActivateAccount />} />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<div className="font-bold text-3xl text-gray-800">Witaj w Dashboardzie LifeOS!</div>} />
          
          <Route path="notes" element={<NotesMain />} />
          <Route path="flashcards" element={<FlashcardsMain />} />
          <Route path="tasks" element={<TasksMain/>}/>
          <Route path="workouts" element={<WorkoutMain/>} />
          <Route path="social" element={<SocialMain />} />
          
          {/* Ustawienia Profilowe */}
          <Route path="settings" element={<Settings />} />
          <Route path="2fa-setup" element={<TwoFactorSetup />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
