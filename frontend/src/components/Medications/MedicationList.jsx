import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { apiService } from '../../services/api';
import { Pill, Edit3, Trash2, Clock, Calendar, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const MedicationList = () => {
  const [selectedMedication, setSelectedMedication] = useState(null);
  const queryClient = useQueryClient();

  const { data: medications, isLoading, error } = useQuery(
    'medications',
    apiService.getMedications
  );

  const deleteMutation = useMutation(apiService.deleteMedication, {
    onSuccess: () => {
      queryClient.invalidateQueries('medications');
      queryClient.invalidateQueries('dashboard-stats');
      toast.success('Medication deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete medication');
    },
  });

  const logMutation = useMutation(apiService.logMedication, {
    onSuccess: () => {
      queryClient.invalidateQueries('medication-logs');
      queryClient.invalidateQueries('dashboard-stats');
      queryClient.invalidateQueries('weekly-adherence');
      toast.success('Medication logged successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to log medication');
    },
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleMarkAsTaken = (medication) => {
    const logData = {
      medication_id: medication.id,
      taken_at: new Date().toISOString(),
      status: 'taken',
      notes: '',
    };
    logMutation.mutate(logData);
  };

  const handleMarkAsMissed = (medication) => {
    const logData = {
      medication_id: medication.id,
      taken_at: new Date().toISOString(),
      status: 'missed',
      notes: '',
    };
    logMutation.mutate(logData);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div>
                  <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Medications</h3>
        <p className="text-gray-600">Please try refreshing the page</p>
      </div>
    );
  }

  if (!medications || medications.length === 0) {
    return (
      <div className="text-center py-12">
        <Pill className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No medications yet</h3>
        <p className="text-gray-600 mb-6">Add your first medication to get started with tracking</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {medications.map((medication) => (
        <div key={medication.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Pill className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{medication.name}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {medication.dosage}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {medication.frequency}
                  </span>
                </div>
                {medication.instructions && (
                  <p className="text-sm text-gray-500 mt-2">{medication.instructions}</p>
                )}
                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                  <span>Start: {format(new Date(medication.start_date), 'MMM dd, yyyy')}</span>
                  {medication.end_date && (
                    <span>End: {format(new Date(medication.end_date), 'MMM dd, yyyy')}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleMarkAsTaken(medication)}
                disabled={logMutation.isLoading}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                title="Mark as taken"
              >
                <CheckCircle2 className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => handleMarkAsMissed(medication)}
                disabled={logMutation.isLoading}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Mark as missed"
              >
                <XCircle className="h-5 w-5" />
              </button>

              <button
                onClick={() => setSelectedMedication(medication)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit medication"
              >
                <Edit3 className="h-5 w-5" />
              </button>

              <button
                onClick={() => handleDelete(medication.id)}
                disabled={deleteMutation.isLoading}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Delete medication"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MedicationList;