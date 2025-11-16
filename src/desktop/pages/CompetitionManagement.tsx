import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@platform/components/Button';
import Input from '@platform/components/Input';

interface Competition {
  _id: string;
  name: string;
  description: string;
  isGlobal: boolean;
  maxTeams: number;
  maxMembersPerTeam: number;
}

const CompetitionManagement: React.FC = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isGlobal: false,
    maxTeams: 10,
    maxMembersPerTeam: 4,
  });

  const handleCreateCompetition = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call API to create competition
    console.log('Creating competition:', formData);
    setShowCreateForm(false);
    setFormData({
      name: '',
      description: '',
      isGlobal: false,
      maxTeams: 10,
      maxMembersPerTeam: 4,
    });
  };

  const handleDeleteCompetition = async (competitionId: string) => {
    if (window.confirm('Are you sure you want to delete this competition?')) {
      // TODO: Call API to delete competition
      console.log('Deleting competition:', competitionId);
      setCompetitions(competitions.filter(c => c._id !== competitionId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mb-6">
        <Link to="/headteacher/dashboard">
          <Button variant="secondary">← Back to Dashboard</Button>
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-8">Competition Management</h1>
      
      <div className="mb-6">
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Cancel' : 'Create New Competition'}
        </Button>
      </div>

      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Competition</h2>
          <form onSubmit={handleCreateCompetition}>
            <div className="mb-4">
              <Input
                label="Competition Name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>
            <div className="mb-4">
              <Input
                label="Max Teams"
                type="number"
                value={formData.maxTeams}
                onChange={(e) => setFormData({ ...formData, maxTeams: parseInt(e.target.value) })}
                min="1"
                required
              />
            </div>
            <div className="mb-4">
              <Input
                label="Max Members Per Team"
                type="number"
                value={formData.maxMembersPerTeam}
                onChange={(e) => setFormData({ ...formData, maxMembersPerTeam: parseInt(e.target.value) })}
                min="1"
                required
              />
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isGlobal}
                  onChange={(e) => setFormData({ ...formData, isGlobal: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">
                  Global Competition (visible to all schools)
                </span>
              </label>
            </div>
            <Button type="submit">Create Competition</Button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitions.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            No competitions found. Create one to get started.
          </div>
        ) : (
          competitions.map((competition) => (
            <div key={competition._id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">{competition.name}</h3>
              <p className="text-gray-600 mb-4">{competition.description}</p>
              <div className="text-sm text-gray-500 mb-4">
                <p>Max Teams: {competition.maxTeams}</p>
                <p>Max Members: {competition.maxMembersPerTeam}</p>
                <p>{competition.isGlobal ? '🌍 Global' : '🏫 School-wide'}</p>
              </div>
              <div className="space-x-2">
                <Button
                  variant="danger"
                  onClick={() => handleDeleteCompetition(competition._id)}
                  className="text-sm"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CompetitionManagement;
