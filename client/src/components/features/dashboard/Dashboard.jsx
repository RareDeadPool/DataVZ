"use client"

import { UploadSection } from "./UploadSection";
import { PreviewSection } from "./PreviewSection";
import { RecentUploads } from "./RecentUploads";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useSelector } from 'react-redux';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Dashboard() {
  const [showModal, setShowModal] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', description: '', category: '' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const uploadedFiles = useSelector(state => state.uploadedFiles.files);

  const handleProjectFormChange = e => setProjectForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleFileChange = e => setFile(e.target.files[0]);

  const handleCreateAndUpload = async e => {
    e.preventDefault();
    setUploading(true);
    setErrorMsg('');
    setSuccessMsg('');
    const token = localStorage.getItem('token');
    try {
      // 1. Create project
      const projRes = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(projectForm),
      });
      if (!projRes.ok) throw new Error('Failed to create project');
      const project = await projRes.json();
      // 2. Upload file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', project._id);
      const uploadRes = await fetch(`${API_URL}/excel/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!uploadRes.ok) throw new Error('Failed to upload file');
      setSuccessMsg('Project created and file uploaded!');
      setShowModal(false);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create project or upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex-1 p-6 bg-background dark:bg-zinc-900 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-white">Dashboard</h1>
            <p className="text-muted-foreground">Manage your Excel uploads and data processing</p>
          </div>
          <Button onClick={() => setShowModal(true)} variant="default">New Project & Upload Data</Button>
        </div>
        {showModal && (
          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Project & Upload Data</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleCreateAndUpload}>
                <Input name="name" placeholder="Project Name" value={projectForm.name} onChange={handleProjectFormChange} required />
                <Input name="description" placeholder="Description" value={projectForm.description} onChange={handleProjectFormChange} />
                <Input name="category" placeholder="Category" value={projectForm.category} onChange={handleProjectFormChange} />
                <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} required />
                <div className="flex gap-2">
                  <Button type="submit" disabled={uploading}>{uploading ? 'Uploading...' : 'Create & Upload'}</Button>
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                </div>
                {errorMsg && <div className="text-red-500 text-sm">{errorMsg}</div>}
                {successMsg && <div className="text-green-600 text-sm">{successMsg}</div>}
              </form>
            </DialogContent>
          </Dialog>
        )}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <UploadSection />
            <PreviewSection />
          </div>
          <div className="space-y-6">
            <RecentUploads />
          </div>
        </div>
      </div>
    </div>
  )
}
