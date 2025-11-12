import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom'; // Use HashRouter for Electron
import Button from '@core/components/Button'; // Example shared component
import Input from '@core/components/Input';   // Example shared component

const HomePage = () => (
  <div>
    <h1>Desktop Home Page</h1>
    <Button>Desktop Button</Button>
    <Input label="Desktop Input" />
  </div>
);
const SettingsPage = () => <h1>Desktop Settings Page</h1>;

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Router>
  );
};

export default App;
