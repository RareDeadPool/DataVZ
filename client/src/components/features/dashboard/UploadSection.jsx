"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X } from "lucide-react"
import { uploadExcelFile } from '@/services/api';
import * as XLSX from 'xlsx';
import { ChartRenderer } from "@/components/features/dashboard/ChartRenderer"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HexColorPicker } from 'react-colorful';
import { Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addUploadedFile } from '@/store/slices/uploadedFilesSlice';

// Helper to detect numeric columns
function isNumericColumn(data, key) {
  return data.every(row => typeof row[key] === 'number' || (!isNaN(parseFloat(row[key])) && isFinite(row[key])));
}

// Helper to determine how many colors to show in custom mode
function getColorCount(chartType, chartData) {
  if (["line", "area", "radar"].includes(chartType)) return 1;
  return Math.max(1, chartData.length);
}

export function UploadSection() {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState("")
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [previewData, setPreviewData] = useState(null);
  const [showChartOptions, setShowChartOptions] = useState(false);
  const chartTypes = [
    { id: "bar", label: "Bar Chart" },
    { id: "horizontalBar", label: "Horizontal Bar" },
    { id: "line", label: "Line Chart" },
    { id: "area", label: "Area Chart" },
    { id: "pie", label: "Pie Chart" },
    { id: "doughnut", label: "Doughnut Chart" },
    { id: "radar", label: "Radar Chart" },
    { id: "polar", label: "Polar Area Chart" },
    { id: "bubble", label: "Bubble Chart" },
    { id: "scatter", label: "Scatter Plot" },
    { id: "3d", label: "3D Column" },
    { id: "3dPie", label: "3D Pie" },
    { id: "3dScatter", label: "3D Scatter" },
  ];
  const [selectedChart, setSelectedChart] = useState(null);
  const [xKey, setXKey] = useState("");
  const [yKey, setYKey] = useState("");
  // For Bubble chart, add a Z axis (size) dropdown
  const [zKey, setZKey] = useState("");
  const [sheets, setSheets] = useState([]); // [{name, data}]
  const [selectedSheet, setSelectedSheet] = useState(0);
  const defaultPalettes = [
    { name: 'Material', colors: ['#3777E0', '#43e', '#e43', '#3e4', '#e34', '#4e3'] },
    { name: 'Pastel', colors: ['#A3C9A8', '#F7B7A3', '#F7DBA7', '#A7C7E7', '#D7A7E7', '#E7A7A7'] },
    { name: 'Vibrant', colors: ['#FF6F61', '#6B5B95', '#88B04B', '#F7CAC9', '#92A8D1', '#955251'] },
    { name: 'Monochrome', colors: ['#222', '#444', '#666', '#888', '#aaa', '#ccc'] },
  ];
  const [customColors, setCustomColors] = useState(["#3777E0"]);
  const [palette, setPalette] = useState(defaultPalettes[0].colors);
  const [paletteName, setPaletteName] = useState(defaultPalettes[0].name);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [pendingPalette, setPendingPalette] = useState(palette);
  const [pendingCustomColors, setPendingCustomColors] = useState(customColors);
  const [pendingPaletteName, setPendingPaletteName] = useState(paletteName);
  const chartContainerRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const user = useSelector(state => state.auth.user);
  // Assume projectId is available (e.g., from props, context, or selected project)
  const projectId = null; // TODO: Replace with actual project ID

  const dispatch = useDispatch();

  // Compute a smart chart title for export
  let chartTitle = '';
  if (yKey && xKey) {
    chartTitle = `${yKey} vs ${xKey}`;
  } else if (yKey) {
    chartTitle = yKey;
  } else if (chartTitle) { // Use existing chartTitle if available
    chartTitle = chartTitle;
  } else {
    chartTitle = 'Chart';
  }

  const validateFileType = (file) => {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ]
    return allowedTypes.includes(file.type) || file.name.match(/\.(xlsx|xls|csv)$/i)
  }

  const validateFileSize = (file) => {
    const maxSize = 10 * 1024 * 1024
    return file.size <= maxSize
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file) => {
    setError("");
    setUploadSuccess(false);
    setPreviewData(null);
    setShowChartOptions(false);
    setSheets([]);
    setSelectedSheet(0);
    if (!validateFileType(file)) {
      setError("Please select a valid Excel (.xlsx, .xls) or CSV file");
      return;
    }
    if (!validateFileSize(file)) {
      setError("File size must be less than 10MB");
      return;
    }
    setSelectedFile(file);
    // Parse file in-browser for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const allSheets = workbook.SheetNames.map((name) => ({
        name,
        data: XLSX.utils.sheet_to_json(workbook.Sheets[name]),
      }));
      console.log("allSheets before dispatch:", allSheets);
      setSheets(allSheets);
      setPreviewData(allSheets[0]?.data.slice(0, 10) || []);
      // Show chart options if columns are found
      if (allSheets[0]?.data && Object.keys(allSheets[0].data[0] || {}).length > 0) {
        setShowChartOptions(true);
        // Dispatch to Redux for global access (store full data, not just preview)
        const fileObj = {
          name: file.name,
          sheets: allSheets,
          uploadedAt: new Date().toISOString(),
        };
        console.log("Dispatching fileObj to Redux:", fileObj);
        dispatch(addUploadedFile(fileObj));
      } else {
        setShowChartOptions(false);
        setError("No columns found in this file. Please upload a valid Excel or CSV file with a header row.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploadLoading(true);
    setUploadProgress(0);
    setError("");
    try {
      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
      // Upload to backend
      const token = localStorage.getItem('token');
      const res = await uploadExcelFile(selectedFile, token);
      setPreviewData(res.preview);
      setShowChartOptions(true);
      setUploadSuccess(true);
      setSelectedFile(null);
      setTimeout(() => {
        setUploadProgress(0);
        setUploadSuccess(false);
      }, 3000);
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploadLoading(false);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null)
    setError("")
    setUploadSuccess(false)
  }

  // Use the selected sheet's data for charting and mapping
  const chartData = sheets[selectedSheet]?.data || previewData || [];

  // Determine which colors to use for ChartRenderer: live update if modal is open, otherwise use applied palette
  const effectivePalette = customizeOpen ? pendingPalette : palette;
  const effectiveCustomColors = customizeOpen ? pendingCustomColors : customColors;

  const handleExportPNG = async () => {
    if (!chartContainerRef.current) return;
    // For 3D charts, use html2canvas on the container
    if (["3d", "3dPie", "3dScatter"].includes(selectedChart)) {
      const canvasElem = chartContainerRef.current;
      const canvasImage = await html2canvas(canvasElem);
      const url = canvasImage.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = (chartTitle || 'chart') + '.png';
      link.click();
      return;
    }
    // For 2D charts, use the chart.js canvas
    const canvas = chartContainerRef.current.querySelector('canvas');
    if (!canvas) return;
    // Draw title above chart on a temp canvas
    const title = chartTitle || 'Chart';
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height + 60;
    const ctx = tempCanvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#222';
    ctx.textAlign = 'center';
    ctx.fillText(title, tempCanvas.width / 2, 40);
    ctx.drawImage(canvas, 0, 60);
    const url = tempCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = title.replace(/\s+/g, '_').toLowerCase() + '.png';
    link.click();
  };
  const handleExportPDF = async () => {
    if (!chartContainerRef.current) return;
    // For 3D charts, use html2canvas on the container
    if (["3d", "3dPie", "3dScatter"].includes(selectedChart)) {
      const canvasElem = chartContainerRef.current;
      const image3d = await html2canvas(canvasElem);
      const imageData3d = image3d.toDataURL('image/png');
      const pdf3d = new jsPDF({ orientation: 'landscape', unit: 'pt', format: [900, 600] });
      pdf3d.setFontSize(24);
      pdf3d.text(chartTitle || 'Chart', 450, 40, { align: 'center' });
      pdf3d.addImage(imageData3d, 'PNG', 0, 60, 900, 500);
      pdf3d.save((chartTitle || 'chart').replace(/\s+/g, '_').toLowerCase() + '.pdf');
      return;
    }
    // For 2D charts, use the chart.js canvas
    const canvas = chartContainerRef.current.querySelector('canvas');
    if (!canvas) return;
    const title = chartTitle || 'Chart';
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height + 60;
    const ctx = tempCanvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#222';
    ctx.textAlign = 'center';
    ctx.fillText(title, tempCanvas.width / 2, 40);
    ctx.drawImage(canvas, 0, 60);
    const image2d = tempCanvas.toDataURL('image/png');
    const pdf2d = new jsPDF({ orientation: 'landscape', unit: 'pt', format: [tempCanvas.width, tempCanvas.height] });
    pdf2d.setFontSize(24);
    pdf2d.text(title, tempCanvas.width / 2, 40, { align: 'center' });
    pdf2d.addImage(image2d, 'PNG', 0, 60, tempCanvas.width, tempCanvas.height - 60);
    pdf2d.save(title.replace(/\s+/g, '_').toLowerCase() + '.pdf');
  };

  const [showAddToProject, setShowAddToProject] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [projectForm, setProjectForm] = useState({ name: '', description: '', category: '' });
  const [creatingProject, setCreatingProject] = useState(false);
  const [savingChart, setSavingChart] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (showAddToProject) {
      const fetchProjects = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/projects`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setProjects(await res.json());
      };
      fetchProjects();
    }
  }, [showAddToProject]);

  const handleProjectFormChange = e => setProjectForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleCreateProject = async e => {
    e.preventDefault();
    setCreatingProject(true);
    setErrorMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(projectForm),
      });
      if (!res.ok) throw new Error('Failed to create project');
      const project = await res.json();
      setProjects(p => [...p, project]);
      setSelectedProject(project._id);
      setProjectForm({ name: '', description: '', category: '' });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create project');
    } finally {
      setCreatingProject(false);
    }
  };

  const handleSaveChartToProject = async () => {
    setSavingChart(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const token = localStorage.getItem('token');
      // Compose chart config from current chart preview state
      const chartPayload = {
        projectId: selectedProject,
        type: selectedChart,
        data: { xKey, yKey, zKey, palette: effectivePalette, customColors: effectiveCustomColors },
      };
      const res = await fetch(`${API_URL}/charts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(chartPayload),
      });
      if (!res.ok) throw new Error('Failed to save chart to project');
      setSuccessMsg('Chart added to project!');
      setShowAddToProject(false);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save chart');
    } finally {
      setSavingChart(false);
    }
  };



  return (
    <Card className="border-dashed border-2">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          <CardTitle>Upload Excel File</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors duration-200 ${
            dragActive ? "border-primary bg-primary/5 dark:bg-primary/20" : "border-muted-foreground/25 hover:border-muted-foreground/50 bg-background dark:bg-zinc-900"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted dark:bg-zinc-800 rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-medium mb-2">Drop your Excel file here</p>
              <p className="text-muted-foreground mb-4">
                or{" "}
                <Label htmlFor="file-upload" className="text-primary hover:text-primary/80 cursor-pointer underline">
                  click to browse files
                </Label>
              </p>
              <Button variant="outline" asChild>
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </Label>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Supports .xlsx and .xls files up to 10MB</p>
          </div>
          <Input id="file-upload" type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileInput} />
        </div>

        {selectedFile && (
          <div className="mt-6 p-4 bg-muted/50 dark:bg-zinc-800 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background dark:bg-zinc-900 rounded">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleUpload} disabled={uploadLoading} size="sm">
                  {uploadLoading ? "Uploading..." : "Upload"}
                </Button>
                <Button variant="ghost" size="sm" onClick={removeSelectedFile}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {uploadLoading && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </div>
        )}

        {uploadSuccess && (
          <Alert className="mt-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-300" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              File uploaded successfully!
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {previewData && (
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
            <div className="mt-4 flex gap-2">
              <Button onClick={handleUpload} disabled={uploadLoading} size="sm">
                {uploadLoading ? "Uploading..." : "Upload"}
              </Button>
              <Button variant="ghost" size="sm" onClick={removeSelectedFile}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        {showChartOptions && previewData && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Convert to Chart</h3>
            <div className="flex gap-4 flex-wrap mb-4">
              {chartTypes.map((type) => (
                <Button
                  key={type.id}
                  variant={selectedChart === type.id ? "default" : "outline"}
                  className="capitalize"
                  onClick={() => {
                    setSelectedChart(type.id);
                    setXKey("");
                    setYKey("");
                    setZKey(""); // Reset Z key for new chart type
                  }}
                >
                  {type.label}
                </Button>
              ))}
            </div>
            {sheets.length > 1 && (
              <div className="mb-4">
                <label className="block mb-1 font-medium">Sheet</label>
                <Select value={String(selectedSheet)} onValueChange={v => {
                  setSelectedSheet(Number(v));
                  setPreviewData(sheets[Number(v)]?.data.slice(0, 10) || []);
                  setXKey(""); setYKey(""); setZKey("");
                }}>
                  <SelectTrigger className="w-64 bg-background">
                    <SelectValue placeholder="Select sheet" />
                  </SelectTrigger>
                  <SelectContent>
                    {sheets.map((sheet, idx) => (
                      <SelectItem key={sheet.name} value={String(idx)}>{sheet.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {selectedChart && (
              <div className="mb-4 flex gap-4 flex-wrap items-end">
                {(selectedChart !== "pie" && selectedChart !== "doughnut" && selectedChart !== "radar" && selectedChart !== "polar") && (
                  <div>
                    <label className="block mb-1 font-medium">X Axis</label>
                    <Select value={xKey} onValueChange={setXKey}>
                      <SelectTrigger className="w-48 bg-background">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(chartData[0] || {})
                          .filter(key => key !== yKey && key !== zKey)
                          .map((key) => (
                            <SelectItem key={key} value={key}>{key}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {(selectedChart === "bubble") && (
                  <div>
                    <label className="block mb-1 font-medium">Size (Z)</label>
                    <Select value={zKey} onValueChange={setZKey}>
                      <SelectTrigger className="w-48 bg-background">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(chartData[0] || {})
                          .filter(key => key !== xKey && key !== yKey)
                          .map((key) => (
                            <SelectItem key={key} value={key}>{key}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <label className="block mb-1 font-medium">{selectedChart === "pie" || selectedChart === "doughnut" || selectedChart === "polar" ? "Category" : selectedChart === "radar" ? "Value" : "Y Axis"}</label>
                  <Select value={yKey} onValueChange={setYKey}>
                    <SelectTrigger className="w-48 bg-background">
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(chartData[0] || {})
                        .filter(key => key !== xKey && key !== zKey)
                        .map((key) => (
                          <SelectItem key={key} value={key}>{key}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            {selectedChart && (
              (selectedChart === "bubble" && xKey && yKey && zKey) ||
              (selectedChart === "radar" && yKey) ||
              (selectedChart === "pie" && yKey) ||
              (selectedChart === "doughnut" && yKey) ||
              (selectedChart === "polar" && yKey) ||
              (selectedChart !== "pie" && selectedChart !== "doughnut" && selectedChart !== "radar" && selectedChart !== "polar" && xKey && yKey)
            ) && (
              <>
                <div style={{ position: 'relative' }}>
                  <div ref={chartContainerRef}>
                    <ChartRenderer
                      key={effectivePalette.join('-') + effectiveCustomColors.join('-') + selectedChart + xKey + yKey + zKey}
                      type={selectedChart}
                      data={chartData}
                      xKey={xKey}
                      yKey={yKey}
                      zKey={zKey}
                      palette={effectivePalette}
                      customColors={effectiveCustomColors}
                    />
                  </div>
                  {/* Export Buttons: Only for 2D charts */}
                  {!["3d", "3dPie", "3dScatter"].includes(selectedChart) && (
                    <div className="flex gap-2 mt-2 justify-end">
                      <Button size="sm" variant="outline" onClick={handleExportPNG}>Export as PNG</Button>
                      <Button size="sm" variant="outline" onClick={handleExportPDF}>Export as PDF</Button>
                    </div>
                  )}
                </div>
                <Button className="mt-4" onClick={() => {
                  setPendingPalette(palette);
                  setPendingCustomColors(customColors);
                  setPendingPaletteName(paletteName);
                  setCustomMode(false);
                  setCustomizeOpen(true);
                }}>Customize Chart</Button>
                <Dialog open={customizeOpen} onOpenChange={setCustomizeOpen}>
                  <DialogContent className="max-w-lg p-6 max-h-[80vh] overflow-y-auto rounded-xl shadow-lg bg-background">
                    <DialogHeader>
                      <DialogTitle>Customize Chart Colors</DialogTitle>
                    </DialogHeader>
                    {/* Mini Chart Preview */}
                    <div className="mb-6 flex flex-col items-center">
                      <span className="block mb-2 text-sm font-semibold text-muted-foreground">Preview</span>
                      <div className="w-full max-w-xs bg-muted rounded-lg p-2 shadow-sm">
                        <Bar data={{ labels: chartData.map((_, i) => `Item ${i + 1}`), datasets: [{ data: chartData.map((_, i) => i + 1), backgroundColor: (!customMode ? pendingPalette : pendingCustomColors).slice(0, Math.max(1, chartData.length)) }] }} options={{ plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }} height={60} />
                      </div>
                    </div>
                    {/* Palette Section */}
                    <div className="mb-6">
                      <span className="block mb-2 text-sm font-semibold">Palette</span>
                      <div className="flex gap-3 flex-wrap mb-2">
                        {defaultPalettes.map((p) => (
                          <button
                            key={p.name}
                            className={`rounded-lg border-2 px-3 py-2 flex gap-1 items-center transition-all duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 ${pendingPaletteName === p.name && !customMode ? 'border-primary ring-2 ring-primary/30' : 'border-muted'}`}
                            onClick={() => { setPendingPalette(p.colors); setPendingPaletteName(p.name); setCustomMode(false); }}
                            type="button"
                            tabIndex={0}
                          >
                            {p.colors.map((c, i) => (
                              <span key={i} style={{ background: c, width: 24, height: 24, borderRadius: 6, display: 'inline-block', border: '2px solid #fff', boxShadow: '0 0 2px #0002' }} />
                            ))}
                            <span className="ml-2 text-xs font-medium">{p.name}</span>
                            {pendingPaletteName === p.name && !customMode && <span className="ml-1 text-primary">✓</span>}
                          </button>
                        ))}
                        <button
                          className={`rounded-lg border-2 px-3 py-2 flex gap-1 items-center transition-all duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 ${customMode ? 'border-primary ring-2 ring-primary/30' : 'border-muted'}`}
                          onClick={() => { setCustomMode(true); setPendingPaletteName('Custom'); }}
                          type="button"
                          tabIndex={0}
                        >
                          <span className="w-6 h-6 bg-gradient-to-br from-gray-200 to-gray-400 rounded" />
                          <span className="ml-2 text-xs font-medium">Custom Palette</span>
                          {customMode && <span className="ml-1 text-primary">✓</span>}
                        </button>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {(!customMode ? pendingPalette : pendingCustomColors).slice(0, getColorCount(selectedChart, chartData)).map((c, i) => (
                          <span key={i} style={{ background: c, width: 28, height: 28, borderRadius: 8, display: 'inline-block', border: '2px solid #fff', boxShadow: '0 0 2px #0002' }} />
                        ))}
                      </div>
                    </div>
                    {/* Custom Colors Section */}
                    {customMode && (
                      <div className="mb-6 bg-muted rounded-lg p-4 shadow-inner">
                        <span className="block mb-2 text-sm font-semibold">Custom Colors</span>
                        <div className="flex gap-4 flex-wrap">
                          {Array.from({ length: getColorCount(selectedChart, chartData) }).map((_, i) => (
                            <div key={i} className="flex flex-col items-center bg-background rounded-lg p-2 shadow-sm">
                              <span className="mb-1 text-xs font-medium text-muted-foreground">Color {i + 1}</span>
                              <HexColorPicker color={pendingCustomColors[i] || '#3777E0'} onChange={c => {
                                const arr = [...pendingCustomColors]; arr[i] = c; setPendingCustomColors(arr); setPendingPalette(arr);
                              }} />
                              <input type="text" value={pendingCustomColors[i] || '#3777E0'} onChange={e => {
                                const arr = [...pendingCustomColors]; arr[i] = e.target.value; setPendingCustomColors(arr); setPendingPalette(arr);
                              }} className="w-20 mt-1 text-xs border rounded px-1" />
                            </div>
                          ))}
                        </div>
                        {getColorCount(selectedChart, chartData) > 1 && (
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline" onClick={() => setPendingCustomColors([...pendingCustomColors, '#3777E0'])}>+ Add Color</Button>
                            {pendingCustomColors.length > 1 && <Button size="sm" variant="destructive" onClick={() => { const arr = [...pendingCustomColors]; arr.pop(); setPendingCustomColors(arr); setPendingPalette(arr); }}>Remove</Button>}
                          </div>
                        )}
                      </div>
                    )}
                    {/* Buttons */}
                    <div className="flex gap-2 justify-end mt-6">
                      <Button variant="outline" onClick={() => {
                        setPendingPalette(palette);
                        setPendingCustomColors(customColors);
                        setPendingPaletteName(paletteName);
                        setCustomMode(false);
                        setCustomizeOpen(false);
                      }}>Cancel</Button>
                      <Button variant="secondary" onClick={() => {
                        setPendingPalette(defaultPalettes[0].colors);
                        setPendingCustomColors(defaultPalettes[0].colors);
                        setPendingPaletteName(defaultPalettes[0].name);
                        setCustomMode(false);
                      }}>Reset</Button>
                      <Button className="w-32" onClick={() => {
                        setPalette(pendingPalette);
                        setCustomColors(pendingCustomColors);
                        setPaletteName(pendingPaletteName);
                        setCustomizeOpen(false);
                      }}>Apply</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        )}
        <Button className="mt-4" onClick={() => setShowAddToProject(true)}>Add to Project</Button>
        {showAddToProject && (
          <Dialog open={showAddToProject} onOpenChange={setShowAddToProject}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Chart to Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(p => (
                      <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-center text-muted-foreground">or</div>
                <form className="space-y-2" onSubmit={handleCreateProject}>
                  <Input name="name" placeholder="Project Name" value={projectForm.name} onChange={handleProjectFormChange} required />
                  <Input name="description" placeholder="Description" value={projectForm.description} onChange={handleProjectFormChange} />
                  <Input name="category" placeholder="Category" value={projectForm.category} onChange={handleProjectFormChange} />
                  <Button type="submit" disabled={creatingProject}>{creatingProject ? 'Creating...' : 'Create Project'}</Button>
                </form>
                <div className="flex gap-2 justify-end mt-4">
                  <Button variant="outline" onClick={() => setShowAddToProject(false)}>Cancel</Button>
                  <Button onClick={handleSaveChartToProject} disabled={!selectedProject || savingChart}>{savingChart ? 'Saving...' : 'Save to Project'}</Button>
                </div>
                {errorMsg && <div className="text-red-500 text-sm">{errorMsg}</div>}
                {successMsg && <div className="text-green-600 text-sm">{successMsg}</div>}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  )
}
