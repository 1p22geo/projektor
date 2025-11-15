import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '@platform/pages/Login';
import Register from '@platform/pages/Register';
import Competitions from '@platform/pages/Competitions';
import CreateTeam from '@platform/pages/CreateTeam';
import Team from '@platform/pages/Team';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import SchoolManagement from './pages/SchoolManagement';
import UserManagement from './pages/UserManagement';
import HeadteacherDashboard from './pages/HeadteacherDashboard';
import CompetitionManagement from './pages/CompetitionManagement';
import Moderation from './pages/Moderation';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/schools" element={<SchoolManagement />} />
        <Route path="/admin/users" element={<UserManagement />} />
        
        {/* Headteacher routes */}
        <Route path="/headteacher/dashboard" element={<HeadteacherDashboard />} />
        <Route path="/headteacher/competitions" element={<CompetitionManagement />} />
        <Route path="/headteacher/moderation" element={<Moderation />} />
        
        {/* Student routes */}
        <Route path="/competitions" element={<Competitions />} />
        <Route path="/competitions/:competitionId/create-team" element={<CreateTeam />} />
        <Route path="/teams/:teamId" element={<Team />} />
      </Routes>
    </Router>
  );
};

export default App;
