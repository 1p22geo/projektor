import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '@core/pages/Login';
import Register from '@core/pages/Register';
import Competitions from '@core/pages/Competitions';
import CompetitionDetails from '@core/pages/CompetitionDetails';
import CreateTeam from '@core/pages/CreateTeam';
import Team from '@core/pages/Team';
import AdminLogin from './pages/AdminLogin';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/competitions" element={<Competitions />} />
        <Route path="/competitions/:competitionId" element={<CompetitionDetails />} />
        <Route path="/competitions/:competitionId/create-team" element={<CreateTeam />} />
        <Route path="/teams/:teamId" element={<Team />} />
      </Routes>
    </Router>
  );
};

export default App;
