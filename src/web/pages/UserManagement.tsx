import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@platform/components/Button';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'HEADTEACHER' | 'STUDENT';
  school?: {
    _id: string;
    name: string;
  };
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  const handleResetPassword = async (userId: string) => {
    if (window.confirm('Reset password for this user?')) {
      // TODO: Call API to reset password
      console.log('Resetting password for user:', userId);
      alert('Password reset successfully. New password sent to user email.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      // TODO: Call API to delete user
      console.log('Deleting user:', userId);
      setUsers(users.filter(u => u._id !== userId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mb-6">
        <Link to="/admin/dashboard">
          <Button variant="secondary">← Back to Dashboard</Button>
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-8">User Management</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                School
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'HEADTEACHER' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.school ? user.school.name : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleResetPassword(user._id)}
                      className="text-sm"
                    >
                      Reset Password
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-sm"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
