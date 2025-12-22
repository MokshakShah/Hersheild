export interface EvidenceLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface Evidence {
  id: string;
  _id?: string;
  type: 'photo' | 'audio';
  dataUri: string;
  timestamp: string;
  createdAt: number;
  location: EvidenceLocation | null;
  size: number;
  path?: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

async function uploadEvidence(type: 'photo' | 'audio', dataUri: string, location: EvidenceLocation | null): Promise<Evidence> {
  const response = await fetch('/api/evidence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, dataUri, location }),
  });

  const data = await handleResponse<{ evidence: Evidence }>(response);
  return data.evidence;
}

async function fetchEvidence(): Promise<Evidence[]> {
  const response = await fetch('/api/evidence');
  const data = await handleResponse<{ evidence: Evidence[] }>(response);
  return data.evidence || [];
}

async function removeEvidence(id: string): Promise<boolean> {
  const response = await fetch(`/api/evidence/${id}`, { method: 'DELETE' });
  await handleResponse(response);
  return true;
}

async function removeAllEvidence(): Promise<boolean> {
  const response = await fetch('/api/evidence', { method: 'DELETE' });
  await handleResponse(response);
  return true;
}

export const evidenceService = {
  setUserKey: (_userKey: string | null | undefined) => {
    // no-op: user isolation now handled server-side
  },
  saveEvidence: uploadEvidence,
  getEvidence: fetchEvidence,
  deleteEvidence: removeEvidence,
  deleteAllEvidence: removeAllEvidence,
};
