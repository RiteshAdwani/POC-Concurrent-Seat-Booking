export const API_BASE = '/api';

export const apiRoute = {
  seats:  `${API_BASE}/seats`,
  health: `${API_BASE}/health`,
} as const;
