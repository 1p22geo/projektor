import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@core/components/Button';
// import { useHeadteacherCompetitions } from '@core/hooks/headteacher/useCompetitions'; // Already exists
// import { useTeamsInSchool } from '@core/hooks/headteacher/moderationHooks'; // Will be implemented in T041

const Moderation: React.FC = () => {
  // const { competitions, loading: compsLoading, error: compsError } = useHeadteacherCompetitions();
  // const { teams, loading: teamsLoading, error: teamsError } = useTeamsInSchool(); // Uncomment when T041 is done

  const competitions = [ // Temporary data
    { _id: 'comp1', name: 'Science Fair 2024' },
    { _id: 'comp2', name: 'Global Coding Challenge' },
  ];

  const teams = [ // Temporary data
    { _id: 'teamA', name: 'Team Alpha', competitionId: 'comp1' },
    { _id: 'teamB', name: 'Team Beta', competitionId: 'comp1' },
    { _id: 'teamX', name: 'Team X-Ray', competitionId: 'comp2' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Headteacher Moderation Dashboard</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Competitions Overview</h2>
        {/* {compsLoading && <p>Loading competitions...</p>}
        {compsError && <p className="text-red-500">Error: {compsError.message}</p>} */}
        <ul>
          {competitions.map((comp) => (
            <li key={comp._id} className="mb-2">
              <span className="font-semibold">{comp.name}</span>
              <Link to={`/moderation/competitions/${comp._id}`}>
                <Button className="ml-4">View Details</Button>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Teams Overview</h2>
        {/* {teamsLoading && <p>Loading teams...</p>}
        {teamsError && <p className="text-red-500">Error: {teamsError.message}</p>} */}
        <ul>
          {teams.map((team) => (
            <li key={team._id} className="mb-2">
              <span className="font-semibold">{team.name}</span> (Competition: {team.competitionId})
              <Link to={`/moderation/teams/${team._id}`}>
                <Button className="ml-4">Moderate Team</Button>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Moderation;
