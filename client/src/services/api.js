export async function uploadExcelFile(file, token) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/excel/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!res.ok) throw new Error('Upload failed');
  return await res.json();
}

export async function getRecentUploads(token) {
  const res = await fetch('/api/excel/recent', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch recent uploads');
  return await res.json();
}

export async function deleteUpload(id, token) {
  const res = await fetch(`/api/excel/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete upload');
  return await res.json();
}

export async function getUploadById(id, token) {
  const res = await fetch(`/api/excel/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch upload');
  return await res.json();
}

export async function getPendingInvitations(token) {
  const res = await fetch('/api/teams/invitations/pending', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch pending invitations');
  return await res.json();
}

export async function respondToInvitation(teamId, status, token) {
  const res = await fetch('/api/teams/invitation/respond', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ teamId, status }),
  });
  if (!res.ok) throw new Error('Failed to respond to invitation');
  return await res.json();
}

export async function askGeminiAI({ prompt, data }) {
  const res = await fetch('/api/ai/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, data }),
  });
  if (!res.ok) throw new Error('AI request failed');
  return await res.json();
}

export async function saveChartHistory({ prompt, chartConfig, favorite }) {
  const res = await fetch('/api/ai/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, chartConfig, favorite }),
  });
  if (!res.ok) throw new Error('Failed to save chart history');
  return await res.json();
}

export async function fetchChartHistory() {
  const res = await fetch('/api/ai/history');
  if (!res.ok) throw new Error('Failed to fetch chart history');
  return await res.json();
}

export async function toggleFavoriteChart(id) {
  const res = await fetch(`/api/ai/history/${id}/favorite`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to toggle favorite');
  return await res.json();
}

export async function generateShareLink(id) {
  const res = await fetch(`/api/ai/history/${id}/share`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to generate share link');
  return await res.json();
}

export async function fetchSharedChart(shareId) {
  const res = await fetch(`/api/ai/share/${shareId}`);
  if (!res.ok) throw new Error('Failed to fetch shared chart');
  return await res.json();
} 