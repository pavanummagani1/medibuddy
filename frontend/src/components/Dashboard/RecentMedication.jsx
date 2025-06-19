import React from 'react';
import { useQuery } from 'react-query';
import { apiService } from '../../services/api';
import { Pill, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const RecentMedications = () => {
  const { data: medications, isLoading, error } = useQuery(
    'recent-medications',
    apiService.getMedications
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Medications</h3>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Medications</h3>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load medications</p>
        </div>
      </div>
    );
  }

  const recentMedications = medications?.slice(0, 5) || [];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Medications</h3>
      
      {recentMedications.length === 0 ? (
        <div className="text-center py-8">
          <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No medications added yet</p>
          <p className="text-sm text-gray-500">Add your first medication to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recentMedications.map((medication) => (
            <div key={medication.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Pill className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{medication.name}</p>
                  <p className="text-sm text-gray-600">
                    {medication.dosage} • {medication.frequency}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{format(new Date(medication.created_at), 'MMM dd')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentMedications;