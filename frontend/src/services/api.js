const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Medications
  async getMedications() {
    return this.request('/medications');
  }

  async createMedication(medication) {
    return this.request('/medications', {
      method: 'POST',
      body: JSON.stringify(medication),
    });
  }

  async updateMedication(id, medication) {
    return this.request(`/medications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(medication),
    });
  }

  async deleteMedication(id) {
    return this.request(`/medications/${id}`, {
      method: 'DELETE',
    });
  }

  // Medication logs
  async getMedicationLogs(date, medicationId) {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (medicationId) params.append('medication_id', medicationId.toString());
    
    return this.request(`/medication-logs?${params}`);
  }

  async logMedication(log) {
    return this.request('/medication-logs', {
      method: 'POST',
      body: JSON.stringify(log),
    });
  }

  // Dashboard
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  async getWeeklyAdherence() {
    return this.request('/dashboard/weekly-adherence');
  }
}

export const apiService = new ApiService();