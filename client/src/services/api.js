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