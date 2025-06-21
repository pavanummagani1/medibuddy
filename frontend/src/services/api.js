const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: getAuthHeaders(),
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Export functions directly (no more `this`)
export const apiService = {
  // Medications
  getMedications: () => request('/medications'),
  createMedication: (medication) =>
    request('/medications', {
      method: 'POST',
      body: JSON.stringify(medication),
    }),
  updateMedication: (id, medication) =>
    request(`/medications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(medication),
    }),
  deleteMedication: (id) =>
    request(`/medications/${id}`, {
      method: 'DELETE',
    }),

  // Medication Logs
  getMedicationLogs: (date, medicationId) => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (medicationId) params.append('medication_id', medicationId.toString());

    return request(`/medication-logs?${params}`);
  },

  logMedication: (log) =>
    request('/medication-logs', {
      method: 'POST',
      body: JSON.stringify(log),
    }),

  // Dashboard
  getDashboardStats: () => request('/dashboard/stats'),
  getWeeklyAdherence: () => request('/dashboard/weekly-adherence'),
};
