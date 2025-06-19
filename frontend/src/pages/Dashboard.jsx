import React from 'react';
import { useQuery } from 'react-query';
import { apiService } from '../services/api';
import DashboardStats from '../components/Dashboard/DashboardStats';
import AdherenceChart from '../components/Dashboard/AdherenceChart';
import RecentMedications from '../components/Dashboard/RecentMedication';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery(
    'dashboard-stats',
    apiService.getDashboardStats
  );

  const { data: weeklyData, isLoading: weeklyLoading, error: weeklyError } = useQuery(
    'weekly-adherence',
    apiService.getWeeklyAdherence
  );

  if (statsLoading || weeklyLoading) {
    return <LoadingSpinner />;
  }

  if (statsError || weeklyError) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Track your medication adherence and health progress</p>
      </div>

      <DashboardStats stats={stats || { totalMedications: 0, todayAdherence: 0, currentStreak: 0 }} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AdherenceChart data={weeklyData || []} />
        <RecentMedications />
      </div>
    </div>
  );
};

export default Dashboard;