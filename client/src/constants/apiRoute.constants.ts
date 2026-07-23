// Mirrors server/src/constants/routes.ts — keep in sync manually,
// the two workspaces don't share a build.

export const API_BASE = '/api'

export const apiRoute = {
  seats: `${API_BASE}/seats`,
  layout: `${API_BASE}/seat-layout`,
  health: `${API_BASE}/health`,
} as const
