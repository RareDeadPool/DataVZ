"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, FileSpreadsheet, Eye } from "lucide-react"
import { useEffect, useState } from 'react';
import { getRecentUploads, deleteUpload, getUploadById } from '@/services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function RecentUploads() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewData, setPreviewData] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const fetchUploads = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await getRecentUploads(token);
      setUploads(data);
    } catch (err) {
      setError('Failed to load recent uploads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this upload?')) return;
    try {
      const token = localStorage.getItem('token');
      await deleteUpload(id, token);
      fetchUploads();
    } catch (err) {
      alert('Failed to delete upload');
    }
  }

  async function handlePreview(id) {
    try {
      const token = localStorage.getItem('token');
      const upload = await getUploadById(id, token);
      // Check if upload.data exists and is an array
      if (upload && upload.data && Array.isArray(upload.data) && upload.data.length > 0) {
        setPreviewData(upload.data.slice(0, 10));
        setPreviewOpen(true);
      } else {
        alert('No data available for preview');
      }
    } catch (err) {
      alert('Failed to fetch upload preview');
    }
  }

  function timeAgo(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  return (
    <Card className="bg-white dark:bg-[#0a0f1a] text-foreground dark:text-white px-2 sm:px-4">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <CardTitle>Recent Uploads</CardTitle>
          </div>
          <Badge variant="secondary">{uploads ? uploads.length : 0}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : uploads.length === 0 ? (
          <div className="text-muted-foreground">No uploads yet.</div>
        ) : (
          <div className="space-y-4">
            {uploads && uploads.map((upload) => (
              <div key={upload?._id || Math.random()} className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-white/80 dark:bg-[#0a0f1a]/80 rounded-lg">
                <div className="p-2 bg-white dark:bg-[#0a0f1a] rounded mb-2 sm:mb-0">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm break-all">{upload?.filename || 'Unknown file'}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {upload?.uploadDate ? timeAgo(upload.uploadDate) : 'Unknown time'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      # {upload?.data && Array.isArray(upload.data) ? upload.data.length : 0} rows
                    </Badge>
                  </div>
                  <div className="flex flex-col xs:flex-row gap-2 mt-2 w-full">
                    <Button variant="ghost" size="sm" className="h-8 px-2 w-full xs:w-auto" onClick={() => handlePreview(upload?._id)}>
                      <Eye className="mr-1 h-3 w-3" />
                      Preview
                    </Button>
                    <Button variant="destructive" size="sm" className="h-8 px-2 w-full xs:w-auto" onClick={() => handleDelete(upload?._id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl w-[98vw] bg-white dark:bg-[#0a0f1a] text-foreground dark:text-white">
          <DialogHeader>
            <DialogTitle>Data Preview</DialogTitle>
          </DialogHeader>
          {previewData && (
            <div className="overflow-x-auto border rounded-lg mt-4">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    {previewData && previewData.length > 0 && previewData[0] ? 
                      Object.keys(previewData[0]).map((key) => (
                        <th key={key} className="px-2 py-1 border-b bg-white dark:bg-[#0a0f1a] text-left">{key}</th>
                      ))
                      : <th className="px-2 py-1 border-b bg-white dark:bg-[#0a0f1a] text-left">No data</th>
                    }
                  </tr>
                </thead>
                <tbody>
                  {previewData && previewData.length > 0 ? 
                    previewData.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="px-2 py-1 border-b">{val}</td>
                        ))}
                      </tr>
                    ))
                    : <tr><td colSpan="1" className="px-2 py-1 border-b text-center">No data available</td></tr>
                  }
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
