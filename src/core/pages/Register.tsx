import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // For web/desktop
import Input from '@core/components/Input';
import Button from '@core/components/Button';
// import useRegisterStudent from '@core/hooks/auth/useRegisterStudent'; // Will be implemented in T024

const Register: React.FC = () => {
  const [token, setToken] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  // const { register, error, loading } = useRegisterStudent(); // Uncomment when T024 is done

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for actual registration logic
    console.log('Register attempt with token:', token, 'name:', name, 'email:', email, 'password:', password);
    // const success = await register(token, name, email, password); // Uncomment when T024 is done
    // if (success) {
    //   navigate('/login'); // Redirect to login page after successful registration
    // }
    navigate('/login'); // Temporary redirect
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg">
        <h3 className="text-2xl font-bold text-center">Student Registration</h3>
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <Input
              label="Registration Token"
              type="text"
              placeholder="Token from your school"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </div>
          <div className="mt-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mt-4">
            <Input
              label="Email"
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mt-4">
            <Input
              label="Password"
              type="password"
              placeholder="Choose a Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-baseline justify-end">
            <Button type="submit">Register</Button>
          </div>
          {/* {error && <p className="text-red-500 text-sm mt-2">{error}</p>} */}
        </form>
      </div>
    </div>
  );
};

export default Register;
