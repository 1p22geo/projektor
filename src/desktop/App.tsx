import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '@platform/pages/Login';
import Register from '@platform/pages/Register';
import Competitions from '@platform/pages/Competitions';
import CreateTeam from '@platform/pages/CreateTeam';
import Team from '@platform/pages/Team';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import SchoolManagement from './pages/SchoolManagement';
import SchoolDetails from './pages/SchoolDetails';
import UserManagement from './pages/UserManagement';
import HeadteacherDashboard from './pages/HeadteacherDashboard';
import CompetitionManagement from './pages/CompetitionManagement';
import Moderation from './pages/Moderation';
import PrivacyPolicy from '@core/pages/PrivacyPolicy';

// Dashboard router component
const Dashboard: React.FC = () => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role === 'headteacher') {
    return <HeadteacherDashboard />;
  }
  
  // Default to competitions for students
  return <Navigate to="/competitions" replace />;
};

// Protected admin route component
const ProtectedAdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const token = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  if (!token || !user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
        <Route path="/admin/schools" element={<ProtectedAdminRoute><SchoolManagement /></ProtectedAdminRoute>} />
        <Route path="/admin/schools/:schoolId" element={<ProtectedAdminRoute><SchoolDetails /></ProtectedAdminRoute>} />
        <Route path="/admin/users" element={<ProtectedAdminRoute><UserManagement /></ProtectedAdminRoute>} />
        
        <Route path="/headteacher/dashboard" element={<HeadteacherDashboard />} />
        <Route path="/headteacher/competitions" element={<CompetitionManagement />} />
        <Route path="/headteacher/moderation" element={<Moderation />} />
        
        <Route path="/competitions" element={<Competitions />} />
        <Route path="/competitions/:competitionId/create-team" element={<CreateTeam />} />
        <Route path="/teams/:teamId" element={<Team />} />
      </Routes>
    </Router>
  );
};

export default App;
