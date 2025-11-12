import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '@core/components/Input';
import Button from '@core/components/Button';
// import useLoginAdmin from '@core/hooks/auth/useLoginAdmin'; // Will be implemented in T015

const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  // const { login, error, loading } = useLoginAdmin(); // Uncomment when T015 is done

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for actual login logic
    console.log('Admin login attempt with password:', password);
    // const success = await login(password); // Uncomment when T015 is done
    // if (success) {
    //   navigate('/admin/dashboard'); // Redirect to admin dashboard
    // }
    navigate('/admin/dashboard'); // Temporary redirect
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg">
        <h3 className="text-2xl font-bold text-center">Admin Login</h3>
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <Input
              label="Password"
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-baseline justify-end">
            <Button type="submit">Login</Button>
          </div>
          {/* {error && <p className="text-red-500 text-sm mt-2">{error}</p>} */}
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
