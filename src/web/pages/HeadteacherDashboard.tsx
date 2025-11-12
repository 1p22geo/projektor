import React, { useState } from 'react';
import Button from '@core/components/Button';
import Input from '@core/components/Input';
// import useGenerateTokens from '@core/hooks/headteacher/useGenerateTokens'; // Will be implemented in T022

const HeadteacherDashboard: React.FC = () => {
  const [tokenCount, setTokenCount] = useState(1);
  const [generatedTokens, setGeneratedTokens] = useState<string[]>([]);
  // const { generateTokens, loading, error } = useGenerateTokens(); // Uncomment when T022 is done

  const handleGenerate = async () => {
    // Placeholder for actual token generation logic
    console.log(`Generating ${tokenCount} tokens...`);
    // const tokens = await generateTokens(tokenCount); // Uncomment when T022 is done
    // if (tokens) {
    //   setGeneratedTokens(tokens);
    // }
    setGeneratedTokens(['TOKEN123', 'TOKEN456', 'TOKEN789']); // Temporary
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Headteacher Dashboard</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Generate Student Registration Tokens</h2>
        <div className="flex items-end space-x-4">
          <Input
            label="Number of Tokens"
            type="number"
            value={tokenCount}
            onChange={(e) => setTokenCount(parseInt(e.target.value))}
            min="1"
            max="100"
            required
          />
          <Button onClick={handleGenerate}>Generate Tokens</Button>
        </div>
        {generatedTokens.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-medium">Generated Tokens:</h3>
            <ul className="list-disc list-inside">
              {generatedTokens.map((token, index) => (
                <li key={index}>{token}</li>
              ))}
            </ul>
          </div>
        )}
        {/* {error && <p className="text-red-500 text-sm mt-2">{error}</p>} */}
      </div>

      {/* Add other headteacher functionalities here */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Competition Management</h2>
        <p className="text-gray-700 mb-4">Create and manage competitions for your school.</p>
        <Button onClick={() => console.log('Navigate to competition management')}>Manage Competitions</Button>
      </div>
    </div>
  );
};

export default HeadteacherDashboard;
