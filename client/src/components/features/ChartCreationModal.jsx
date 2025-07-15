import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, LineChart, PieChart, TrendingUp, ScatterChart, Radar } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar } from '@/components/ui/avatar';

export function ChartCreationModal({ 
  open, 
  onOpenChange, 
  editingChart, 
  onChartSave, 
  availableData, 
  uploadedFiles, 
  projectId // <-- add projectId as a prop
}) {
  const [chartData, setChartData] = useState({
    title: '',
    type: 'bar',
    xKey: '',
    yKey: '',
    data: availableData
  });

  const [selectedFile, setSelectedFile] = useState(0);
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [error, setError] = useState("");
  const [filesWithData, setFilesWithData] = useState(uploadedFiles);

  // Patch: Ensure file sheet data is loaded for column selection
  useEffect(() => {
    async function fetchFileDataIfNeeded() {
      if (!open || !uploadedFiles[selectedFile]) return;
      const file = uploadedFiles[selectedFile];
      // If no sheets or no data, fetch file details
      if (!file.sheets || !file.sheets[selectedSheet] || !Array.isArray(file.sheets[selectedSheet].data) || file.sheets[selectedSheet].data.length === 0) {
        try {
          const token = localStorage.getItem('token');
          const id = file._id || file.id;
          const res = await fetch(`/api/excel/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const fileDetails = await res.json();
            // Patch the uploadedFiles array with the new data
            const newFiles = [...uploadedFiles];
            newFiles[selectedFile] = { ...file, ...fileDetails };
            setFilesWithData(newFiles);
          }
        } catch (err) {
          // Optionally handle error
        }
      } else {
        setFilesWithData(uploadedFiles);
      }
    }
    fetchFileDataIfNeeded();
    // eslint-disable-next-line
  }, [open, selectedFile, selectedSheet, uploadedFiles]);

  useEffect(() => {
    if (editingChart) {
      setChartData(editingChart);
    } else {
      setChartData({
        title: '',
        type: 'bar',
        xKey: '',
        yKey: '',
        data: availableData
      });
    }
  }, [editingChart, availableData]);

  // Always select the most recent uploaded file and its first sheet when modal opens or files change
  useEffect(() => {
    if (uploadedFiles && uploadedFiles.length > 0 && open) {
      setSelectedFile(uploadedFiles.length - 1);
      setSelectedSheet(0);
    }
  }, [uploadedFiles, open]);

  const chartTypes = [
    { value: 'bar', label: 'Bar Chart', icon: BarChart3, description: 'Compare values across categories', axes: 2 },
    { value: 'line', label: 'Line Chart', icon: LineChart, description: 'Show trends over time', axes: 2 },
    { value: 'pie', label: 'Pie Chart', icon: PieChart, description: 'Show proportions of a whole', axes: 1 },
    { value: 'doughnut', label: 'Doughnut Chart', icon: PieChart, description: 'Show proportions of a whole', axes: 1 },
    { value: 'polar', label: 'Polar Area Chart', icon: PieChart, description: 'Show proportions in a polar area', axes: 1 },
    { value: 'scatter', label: 'Scatter Plot', icon: ScatterChart, description: 'Show correlation between variables', axes: 2 },
    { value: 'area', label: 'Area Chart', icon: TrendingUp, description: 'Highlight magnitude of change', axes: 2 },
    { value: 'radar', label: 'Radar Chart', icon: Radar, description: 'Compare multiple variables', axes: 2 },
  ];

  const selectedType = chartTypes.find(t => t.value === chartData.type) || chartTypes[0];
  const requireX = selectedType.axes >= 1;
  const requireY = selectedType.axes === 2;

  // Use filesWithData for currentData, fallback to preview if needed
  let currentData = [];
  const fileObj = filesWithData[selectedFile];
  if (fileObj) {
    if (fileObj.sheets && fileObj.sheets[selectedSheet] && Array.isArray(fileObj.sheets[selectedSheet].data) && fileObj.sheets[selectedSheet].data.length > 0) {
      currentData = fileObj.sheets[selectedSheet].data;
    } else if (Array.isArray(fileObj.preview) && fileObj.preview.length > 0) {
      currentData = fileObj.preview;
    } else {
      currentData = availableData;
    }
  } else {
    currentData = availableData;
  }
  const availableColumns = currentData.length > 0 ? Object.keys(currentData[0]) : [];
  const hasColumns = availableColumns.length > 0;
  const hasRows = currentData && currentData.length > 0;

  const handleSave = () => {
    setError("");
    if (!chartData.title || !chartData.type || (requireX && !chartData.xKey) || (requireY && !chartData.yKey)) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!projectId) {
      setError("Project ID is missing. Please refresh the page or try again from the project workspace.");
      return;
    }
    onChartSave({
      ...chartData,
      data: currentData,
      projectId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        <DialogHeader>
          <DialogTitle className="text-xl">
            {editingChart ? 'Edit Chart' : 'Create New Chart'}
          </DialogTitle>
          <DialogDescription>
            Configure your chart settings and data mapping
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label htmlFor="title">Chart Title</Label>
              <Input
                id="title"
                value={chartData.title || ""}
                onChange={(e) => setChartData({ ...chartData, title: e.target.value })}
                placeholder="Enter chart title"
              />
            </div>
            <div>
              <Label>Data Source</Label>
              <Select value={selectedFile.toString()} onValueChange={(value) => setSelectedFile(parseInt(value))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a file" />
                </SelectTrigger>
                <SelectContent>
                  {uploadedFiles.map((file, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      <div className="flex items-center gap-2">
                        {file.userId && file.userId.avatar && (
                          <Avatar src={file.userId.avatar} alt={file.userId.name} className="w-5 h-5" />
                        )}
                        <span>{file.filename || file.name || `File ${index + 1}`}</span>
                        {file.userId && file.userId.name && (
                          <span className="text-xs text-slate-500 ml-2">by {file.userId.name}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Chart Type Selection */}
          <div className="mb-6">
            <Label className="text-base font-medium mb-2 block">Chart Type</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {chartTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = chartData.type === type.value;
                return (
                  <Card
                    key={type.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? 'ring-2 ring-blue-500 bg-blue-600 text-white border-blue-600' // main card
                        : 'hover:bg-slate-50 border-slate-200'
                    }`}
                    onClick={() => setChartData({ ...chartData, type: type.value })}
                  >
                    <div className="flex flex-col items-start p-4">
                      <div className={`flex items-center gap-2 text-base font-semibold ${isSelected ? 'text-white' : ''}`}>
                        <Icon className="h-5 w-5" />
                        {type.label}
                      </div>
                      <div className={`text-sm mt-1 ${isSelected ? 'text-white text-opacity-90' : 'text-muted-foreground'}`}>{type.description}</div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
          <hr className="my-6 border-slate-200" />

          {/* Data Mapping */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {requireX && (
              <div>
                <Label htmlFor="xAxis">{requireY ? "X-Axis (Categories)" : "Category/Value"}</Label>
                {availableColumns.length === 0 ? (
                  <div className="text-slate-400 text-sm mt-2">No columns available. Please upload a file with data.</div>
                ) : (
                  <Select value={chartData.xKey || ""} onValueChange={(value) => setChartData({ ...chartData, xKey: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableColumns.map((column) => (
                        <SelectItem key={column} value={column}>
                          {column}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
            {requireY && (
              <div>
                <Label htmlFor="yAxis">Y-Axis (Values)</Label>
                {availableColumns.length === 0 ? (
                  <div className="text-slate-400 text-sm mt-2">No columns available. Please upload a file with data.</div>
                ) : (
                  <Select value={chartData.yKey || ""} onValueChange={(value) => setChartData({ ...chartData, yKey: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableColumns.map((column) => (
                        <SelectItem key={column} value={column}>
                          {column}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </div>

          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    onClick={handleSave}
                    disabled={!chartData.title || !chartData.type || (requireX && !chartData.xKey) || (requireY && !chartData.yKey) || !hasColumns || !hasRows}
                  >
                    {editingChart ? 'Save Changes' : 'Create Chart'}
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {!hasColumns
                  ? 'No columns found. Please upload a valid Excel or CSV file with a header row.'
                  : !chartData.title
                  ? 'Please enter a chart title.'
                  : !chartData.type
                  ? 'Please select a chart type.'
                  : (requireX && !chartData.xKey)
                  ? 'Please select a column for the X-Axis or Category.'
                  : (requireY && !chartData.yKey)
                  ? 'Please select a column for the Y-Axis.'
                  : ''}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}