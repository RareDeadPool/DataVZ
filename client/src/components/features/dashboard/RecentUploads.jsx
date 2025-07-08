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
      setPreviewData(upload.data.slice(0, 10));
      setPreviewOpen(true);
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
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <CardTitle>Recent Uploads</CardTitle>
          </div>
          <Badge variant="secondary">{uploads.length}</Badge>
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
            {uploads.map((upload) => (
              <div key={upload._id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="p-2 bg-background rounded">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{upload.filename}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {timeAgo(upload.uploadDate)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      # {upload.data.length} rows
                    </Badge>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handlePreview(upload._id)}>
                      <Eye className="mr-1 h-3 w-3" />
                      Preview
                    </Button>
                    <Button variant="destructive" size="sm" className="h-8 px-2" onClick={() => handleDelete(upload._id)}>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Data Preview</DialogTitle>
          </DialogHeader>
          {previewData && (
            <div className="overflow-x-auto border rounded-lg mt-4">
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
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
