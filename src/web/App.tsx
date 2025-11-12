import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Button from '@core/components/Button'; // Example shared component
import Input from '@core/components/Input';   // Example shared component

const HomePage = () => (
  <div>
    <h1>Web Home Page</h1>
    <Button>Web Button</Button>
    <Input label="Web Input" />
  </div>
);
const AboutPage = () => <h1>Web About Page</h1>;

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Router>
  );
};

export default App;
