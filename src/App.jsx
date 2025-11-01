import React from 'react';
import VacancyList from './components/VacancyList';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Section */}
      <header className="bg-gradient-to-r from-blue-500 to-indigo-600 py-12 mb-8 shadow-lg text-center text-white">
        <h1 className="text-3xl font-bold tracking-wide mb-4">
          Lowongan Maganghub Batch 2
        </h1>
        <p className="text-lg">Spill lowongan Maganghub di Batch 2!</p>
      </header>
      <VacancyList />
    </div>
  );
}

export default App;
