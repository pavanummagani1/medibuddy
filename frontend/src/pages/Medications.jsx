import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import MedicationList from '../components/Medications/MedicationList';
import MedicationForm from '../components/Medications/MedicationForm';

const Medications = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);

  const handleAddNew = () => {
    setSelectedMedication(null);
    setShowForm(true);
  };

  const handleEdit = (medication) => {
    setSelectedMedication(medication);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedMedication(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Medications</h1>
          <p className="text-gray-600">Manage your medications and track your daily intake</p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl"
        >
          <Plus className="h-5 w-5" />
          <span>Add Medication</span>
        </button>
      </div>

      <MedicationList onEdit={handleEdit} />

      {showForm && (
        <MedicationForm
          medication={selectedMedication}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default Medications;