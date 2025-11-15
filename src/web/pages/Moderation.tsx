import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@platform/components/Button';

interface Team {
  _id: string;
  name: string;
  competition: {
    _id: string;
    name: string;
  };
  members: Array<{
    userId: string;
    name: string;
  }>;
}

const Moderation: React.FC = () => {
  const teams: Team[] = [];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mb-6">
        <Link to="/headteacher/dashboard">
          <Button variant="secondary">← Back to Dashboard</Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Team Moderation</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Competition
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Members
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teams.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No teams found.
                </td>
              </tr>
            ) : (
              teams.map((team) => (
                <tr key={team._id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {team.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {team.competition.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {team.members.length} members
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/headteacher/teams/${team._id}`}>
                      <Button className="text-sm">View Details</Button>
                    </Link>
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

export default Moderation;
