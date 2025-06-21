import React from 'react';

const DashboardStats = ({ stats }) => {
  const { totalMedications = 0, todayAdherence = 0, currentStreak = 0 } = stats || {};

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl shadow">
        <p className="text-gray-500">Total Medications</p>
        <h2 className="text-2xl font-bold text-gray-800">{totalMedications}</h2>
      </div>
      <div className="bg-white p-6 rounded-xl shadow">
        <p className="text-gray-500">Today's Adherence</p>
        <h2 className="text-2xl font-bold text-blue-600">{todayAdherence}%</h2>
      </div>
      <div className="bg-white p-6 rounded-xl shadow">
        <p className="text-gray-500">Current Streak</p>
        <h2 className="text-2xl font-bold text-green-600">{currentStreak} days</h2>
      </div>
    </div>
  );
};

export default DashboardStats;
