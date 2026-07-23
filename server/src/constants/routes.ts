export const API_BASE = '/api';

export const apiRoute = {
  seats:  `${API_BASE}/seats`,
  layout: `${API_BASE}/seat-layout`,
  health: `${API_BASE}/health`,
} as const;
