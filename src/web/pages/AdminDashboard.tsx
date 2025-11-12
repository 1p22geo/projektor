import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@core/components/Button';

const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">School Management</h2>
          <p className="text-gray-700 mb-4">Manage verified schools, create new ones, or update existing school details.</p>
          <Link to="/admin/schools">
            <Button>Manage Schools</Button>
          </Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <p className="text-gray-700 mb-4">Oversee all user accounts, reset passwords, or delete users.</p>
          <Link to="/admin/users">
            <Button>Manage Users</Button>
          </Link>
        </div>
        {/* Add more admin functionalities here */}
      </div>
    </div>
  );
};

export default AdminDashboard;
