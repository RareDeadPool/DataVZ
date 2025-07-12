import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function FileUploadZone({ onFileUpload, onFileDelete, uploadedFiles, loading, error, onFileSelect, selectedFileId }) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => onFileUpload(file));
  }, [onFileUpload]);

  const handleFileInput = useCallback((e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => onFileUpload(file));
  }, [onFileUpload]);

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
          isDragActive 
            ? "border-blue-400 bg-blue-50" 
            : "border-slate-300 hover:border-slate-400"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        <Upload className={cn(
          "w-10 h-10 mx-auto mb-4",
          isDragActive ? "text-blue-500" : "text-slate-400"
        )} />
        <p className="text-lg font-medium text-slate-700 mb-2">
          {isDragActive ? "Drop files here" : "Drag & drop files here"}
        </p>
        <p className="text-sm text-slate-500 mb-4">
          or click to browse for Excel (.xlsx, .xls) or CSV files
        </p>
        <Button variant="outline" size="sm" disabled={loading}>
          {loading ? 'Uploading...' : 'Browse Files'}
        </Button>
        <input
          id="file-input"
          type="file"
          multiple
          accept=".xlsx,.xls,.csv"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm p-2 bg-red-50 border border-red-200 rounded">
          {error}
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-foreground dark:text-white">Uploaded Files</h4>
          {uploadedFiles.map((file) => (
            <div
              key={file._id || file.id}
              className={cn(
                "flex items-center justify-between p-3 bg-card dark:bg-zinc-900 rounded-lg border border-border",
                selectedFileId === (file._id || file.id) ? 'ring-2 ring-primary' : ''
              )}
              onClick={() => onFileSelect && onFileSelect(file._id || file.id)}
            >
              <div className="flex items-center space-x-3">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground dark:text-white">{file.filename || file.name}</p>
                  <p className="text-sm text-muted-foreground">{file.size ? file.size : ''}</p>
                </div>
                <Badge variant="secondary">
                  {file.sheets?.length || 1} sheet{file.sheets?.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileDelete(file._id || file.id);
                }}
                disabled={loading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}