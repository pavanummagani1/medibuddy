import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { apiService } from '../../services/api';
import { X, Pill, Calendar, Clock, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const MedicationForm = ({ medication, onClose }) => {
  const queryClient = useQueryClient();
  const isEditing = !!medication;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: medication || {
      name: '',
      dosage: '',
      frequency: '',
      instructions: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
    },
  });

  useEffect(() => {
    if (medication) {
      reset({
        ...medication,
        start_date: medication.start_date?.split('T')[0] || '',
        end_date: medication.end_date?.split('T')[0] || '',
      });
    }
  }, [medication, reset]);

  const createMutation = useMutation(apiService.createMedication, {
    onSuccess: () => {
      queryClient.invalidateQueries('medications');
      queryClient.invalidateQueries('dashboard-stats');
      toast.success('Medication added successfully');
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add medication');
    },
  });

  const updateMutation = useMutation(
    (data) => apiService.updateMedication(medication.id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('medications');
        queryClient.invalidateQueries('dashboard-stats');
        toast.success('Medication updated successfully');
        onClose();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update medication');
      },
    }
  );

  const onSubmit = (data) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Edit Medication' : 'Add New Medication'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Medication Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Pill className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                type="text"
                {...register('name', { required: 'Medication name is required' })}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="e.g., Aspirin, Metformin"
              />
            </div>
            {errors.name && (
              <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 mb-2">
              Dosage *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="dosage"
                type="text"
                {...register('dosage', { required: 'Dosage is required' })}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.dosage ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="e.g., 50mg, 1 tablet"
              />
            </div>
            {errors.dosage && (
              <p className="mt-2 text-sm text-red-600">{errors.dosage.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
              Frequency *
            </label>
            <select
              id="frequency"
              {...register('frequency', { required: 'Frequency is required' })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.frequency ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            >
              <option value="">Select frequency</option>
              <option value="Once daily">Once daily</option>
              <option value="Twice daily">Twice daily</option>
              <option value="Three times daily">Three times daily</option>
              <option value="Four times daily">Four times daily</option>
              <option value="Every other day">Every other day</option>
              <option value="Once weekly">Once weekly</option>
              <option value="As needed">As needed</option>
            </select>
            {errors.frequency && (
              <p className="mt-2 text-sm text-red-600">{errors.frequency.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
              Instructions
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                id="instructions"
                rows={3}
                {...register('instructions')}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors border-gray-300"
                placeholder="e.g., Take with food, Avoid alcohol"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="start_date"
                  type="date"
                  {...register('start_date', { required: 'Start date is required' })}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.start_date ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.start_date && (
                <p className="mt-2 text-sm text-red-600">{errors.start_date.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="end_date"
                  type="date"
                  {...register('end_date')}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors border-gray-300"
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  {isEditing ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                isEditing ? 'Update Medication' : 'Add Medication'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicationForm;