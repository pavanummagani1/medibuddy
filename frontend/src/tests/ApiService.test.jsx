import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiService } from '../services/api';

// Mock fetch
global.fetch = vi.fn();

describe('ApiService', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('makes GET request to medications endpoint', async () => {
    const mockMedications = [
      { id: 1, name: 'Test Med', dosage: '50mg', frequency: 'Once daily' }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockMedications,
    });

    const result = await apiService.getMedications();

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/medications',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
    expect(result).toEqual(mockMedications);
  });

  it('includes authorization header when token exists', async () => {
    localStorage.setItem('token', 'test-token');

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await apiService.getMedications();

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/medications',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token',
        }),
      })
    );
  });

  it('throws error on failed request', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Unauthorized' }),
    });

    await expect(apiService.getMedications()).rejects.toThrow('Unauthorized');
  });

  it('creates medication with POST request', async () => {
    const medicationData = {
      name: 'Test Med',
      dosage: '50mg',
      frequency: 'Once daily',
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, ...medicationData }),
    });

    const result = await apiService.createMedication(medicationData);

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/medications',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(medicationData),
      })
    );
    expect(result).toEqual({ id: 1, ...medicationData });
  });
});