"use client"

import { UploadSection } from "./UploadSection";
import { PreviewSection } from "./PreviewSection";
import { RecentUploads } from "./RecentUploads";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useSelector } from 'react-redux';
import { BrainCircuit } from 'lucide-react';
import { askGeminiSummary } from '@/services/api';
import ReactMarkdown from 'react-markdown';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

const API_URL = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

export default function Dashboard() {
  const [showModal, setShowModal] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', description: '', category: '' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const uploadedFiles = useSelector(state => state.uploadedFiles.files);
  const [previewData, setPreviewData] = useState(null);
  const [showAISummary, setShowAISummary] = useState(false);
  const [aiSummary, setAISummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);

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
      // Try to get preview data from response
      const uploadResult = await uploadRes.json();
      if (uploadResult && uploadResult.preview) {
        setPreviewData(uploadResult.preview);
      }
      setSuccessMsg('Project created and file uploaded!');
      setShowModal(false);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create project or upload file');
    } finally {
      setUploading(false);
    }
  };

  // Example: gather all chart data for summary (replace with real chart data as needed)
  const allCharts = uploadedFiles || [];

  const handleShowAISummary = async () => {
    setShowAISummary(true);
    setLoadingSummary(true);
    try {
      // You may want to gather all chart data here
      const summary = await askGeminiSummary({ prompt: 'Summarize all dashboard charts', data: allCharts });
      setAISummary(summary.text ? summary.text : 'No summary available.');
    } catch (err) {
      setAISummary('Failed to generate summary.');
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <div className="flex-1 p-2 sm:p-4 md:p-6 bg-background min-h-screen">
      {/* Floating AI Summary Button */}
      {uploadedFiles && uploadedFiles.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 shadow-lg rounded-full h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white animate-pulse focus:animate-bounce transition-all duration-300"
                onClick={handleShowAISummary}
                size="icon"
                style={{ fontSize: 24 }}
                aria-label="Show AI Summary"
              >
                <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60 animate-ping"></span>
                <BrainCircuit className="h-7 w-7 relative z-10" />
                <span className="sr-only">Show AI Summary</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-base font-semibold">
              ✨ Get Instant AI Insights!
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      <Dialog open={showAISummary} onOpenChange={setShowAISummary}>
        <DialogContent className="max-w-lg w-[95vw] p-0 overflow-hidden rounded-2xl shadow-2xl border-0">
          <div className="bg-blue-50 dark:bg-blue-950 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2">
              <BrainCircuit className="h-7 w-7 text-blue-600" />
              <div>
                <DialogTitle className="text-lg font-bold text-blue-900 dark:text-blue-200">AI Summary</DialogTitle>
                <DialogDescription className="text-sm text-blue-700 dark:text-blue-300">Vizard says: Here’s what I found</DialogDescription>
              </div>
            </div>
            <div className="relative bg-white dark:bg-blue-950/80 rounded-lg p-4 shadow-inner max-h-72 overflow-y-auto border border-blue-100 dark:border-blue-800">
              {loadingSummary ? (
                <div className="text-blue-700">Generating summary...</div>
              ) : (
                <ReactMarkdown>{aiSummary}</ReactMarkdown>
              )}
              <button
                className="absolute top-2 right-2 text-xs text-blue-500 hover:text-blue-700 bg-blue-100 dark:bg-blue-900/40 rounded px-2 py-1"
                aria-label="Copy summary"
                onClick={() => navigator.clipboard.writeText(aiSummary)}
              >
                Copy Summary
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-0">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground dark:text-white">Dashboard</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Manage your Excel uploads and data processing</p>
          </div>
          <Button onClick={() => setShowModal(true)} variant="default" className="w-full sm:w-auto">New Project & Upload Data</Button>
        </div>
        {showModal && (
          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogContent className="w-[95vw] max-w-md">
              <DialogHeader>
                <DialogTitle>New Project & Upload Data</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleCreateAndUpload}>
                <Input name="name" placeholder="Project Name" value={projectForm.name} onChange={handleProjectFormChange} required />
                <Input name="description" placeholder="Description" value={projectForm.description} onChange={handleProjectFormChange} />
                <Input name="category" placeholder="Category" value={projectForm.category} onChange={handleProjectFormChange} />
                <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} required />
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button type="submit" disabled={uploading} className="w-full sm:w-auto">{uploading ? 'Uploading...' : 'Create & Upload'}</Button>
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="w-full sm:w-auto">Cancel</Button>
                </div>
                {errorMsg && <div className="text-red-500 text-sm">{errorMsg}</div>}
                {successMsg && <div className="text-green-600 text-sm">{successMsg}</div>}
              </form>
            </DialogContent>
        )}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <UploadSection />
            {previewData ? (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Data Preview</h3>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr>
                        {Object.keys(previewData[0] || {}).map((key) => (
                          <th key={key} className="px-2 py-1 border-b bg-muted text-left">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((val, j) => (
                            <td key={j} className="px-2 py-1 border-b">{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <PreviewSection />
            )}
          </div>
          <div className="space-y-6">
            <RecentUploads />
          </div>
        </div>
      </div>
    </div>
  )
}
