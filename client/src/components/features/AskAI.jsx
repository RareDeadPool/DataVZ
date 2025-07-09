"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sparkles, Send, BarChart3, TrendingUp, Search, FileSpreadsheet, Clock, Star } from "lucide-react"
import { askGeminiAI } from '@/services/api';
import * as XLSX from 'xlsx';
import { ChartRenderer } from '@/components/features/dashboard/ChartRenderer';
import { saveChartHistory, fetchChartHistory, toggleFavoriteChart, generateShareLink, fetchSharedChart } from '@/services/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useLocation, useNavigate } from 'react-router-dom';

const quickActions = [
  {
    title: "Create Visualization",
    description: "Generate charts from your data",
    icon: BarChart3,
  },
  {
    title: "Analyze Trends",
    description: "Identify patterns and insights",
    icon: TrendingUp,
  },
  {
    title: "Data Insights",
    description: "Extract meaningful information",
    icon: Search,
  },
  {
    title: "Generate Dashboard",
    description: "Create comprehensive reports",
    icon: FileSpreadsheet,
  },
]

const recentConversations = [
  {
    title: "Sales Dashboard Creation",
    time: "2 hours ago",
  },
  {
    title: "Customer Analytics Review",
    time: "1 day ago",
  },
  {
    title: "Inventory Trend Analysis",
    time: "3 days ago",
  },
]

export default function Vizard() {
  const [message, setMessage] = useState("")
  const [excelData, setExcelData] = useState(null);
  const [chartConfig, setChartConfig] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [chartHistory, setChartHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const chartContainerRef = useRef();
  const [shareUrl, setShareUrl] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const loadHistory = async () => {
      setHistoryLoading(true);
      try {
        const history = await fetchChartHistory();
        setChartHistory(history);
      } catch (err) {
        // Optionally handle error
      } finally {
        setHistoryLoading(false);
      }
    };
    loadHistory();
  }, []);

  // Load shared chart if shareId is in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shareId = params.get('share');
    if (shareId) {
      fetchSharedChart(shareId).then(({ prompt, chartConfig }) => {
        setMessage(prompt);
        setChartConfig(chartConfig);
        setAiError("");
      }).catch(() => {
        setAiError('Failed to load shared chart.');
      });
    }
  }, [location.search]);

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet);
      setExcelData(json);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setAiLoading(true);
    setAiError("");
    setChartConfig(null);
    try {
      const res = await askGeminiAI({ prompt: message, data: excelData });
      if (res.chartConfig) {
        setChartConfig(res.chartConfig);
        // Save to history
        try {
          await saveChartHistory({ prompt: message, chartConfig: res.chartConfig });
          const history = await fetchChartHistory();
          setChartHistory(history);
        } catch (err) {
          // Optionally handle error
        }
      } else {
        setAiError(res.error || "AI did not return a valid chart config.");
      }
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleHistoryClick = (entry) => {
    setMessage(entry.prompt);
    setChartConfig(entry.chartConfig);
    setAiError("");
  };

  const handleToggleFavorite = async (entry, e) => {
    e.stopPropagation();
    try {
      await toggleFavoriteChart(entry._id);
      const history = await fetchChartHistory();
      setChartHistory(history);
    } catch (err) {
      // Optionally handle error
    }
  };

  const handleShareChart = async (entry, e) => {
    e?.stopPropagation();
    try {
      const { shareId } = await generateShareLink(entry._id);
      const url = `${window.location.origin}/vizard?share=${shareId}`;
      setShareUrl(url);
      setShowShareModal(true);
    } catch (err) {
      setAiError('Failed to generate share link.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleExportImage = async () => {
    if (!chartContainerRef.current) return;
    const canvas = await html2canvas(chartContainerRef.current);
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = 'chart.png';
    link.click();
  };

  const handleExportPDF = async () => {
    if (!chartContainerRef.current) return;
    const canvas = await html2canvas(chartContainerRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape' });
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, 'PNG', 10, 10, width - 20, height - 20);
    pdf.save('chart.pdf');
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6 bg-background">
      {/* History Sidebar */}
      <div className="w-full md:w-80 mb-6 md:mb-0">
        <div className="bg-muted/40 rounded-lg p-4 h-full">
          <div className="font-semibold mb-2 text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" /> Chart History
          </div>
          {historyLoading ? (
            <p className="text-xs text-muted-foreground">Loading history...</p>
          ) : chartHistory.length === 0 ? (
            <p className="text-xs text-muted-foreground">No charts yet. Generate a chart to see history here.</p>
          ) : (
            <ul className="space-y-2 max-h-[400px] overflow-y-auto">
              {chartHistory.map((entry) => (
                <li key={entry._id} className="p-2 rounded hover:bg-muted/60 cursor-pointer flex items-center gap-2" onClick={() => handleHistoryClick(entry)}>
                  <span className="truncate flex-1" title={entry.prompt}>{entry.prompt}</span>
                  <button
                    className="ml-1 p-1 rounded hover:bg-yellow-100"
                    title={entry.favorite ? 'Unstar' : 'Star'}
                    onClick={(e) => handleToggleFavorite(entry, e)}
                  >
                    <Star className={`h-4 w-4 ${entry.favorite ? 'text-yellow-500 fill-yellow-400' : 'text-gray-400'}`} />
                  </button>
                  <button
                    className="ml-1 p-1 rounded hover:bg-blue-100"
                    title="Share chart"
                    onClick={(e) => handleShareChart(entry, e)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 8a3 3 0 11-6 0 3 3 0 016 0zm6 8a3 3 0 11-6 0 3 3 0 016 0zm-6 0a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {/* Main Vizard UI */}
      <div className="flex-1 max-w-xl mx-auto">
        <Card className="flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle>Describe Your Chart</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input
              placeholder="E.g. Bar chart of sales by region, x: Region, y: Sales, data: North 100, South 200, East 150, West 120"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <div className="flex gap-2 items-center">
              <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileInput} />
              {excelData && <span className="text-xs text-green-600">Excel loaded ({excelData.length} rows)</span>}
            </div>
            <Button onClick={handleSendMessage} disabled={!message.trim() || aiLoading}>
              <Send className="h-4 w-4 mr-2" /> Generate Chart
            </Button>
            <div className="bg-muted/40 rounded-lg p-3 mt-2">
              <div className="font-semibold mb-1 text-sm">How to ask Vizard:</div>
              <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
                <li>"Bar chart of sales by region, x: Region, y: Sales, data: North 100, South 200, East 150, West 120"</li>
                <li>"Pie chart of expenses, data: Rent 500, Food 200, Utilities 100, Other 50"</li>
                <li>"Line chart of temperature over time, x: Month, y: Temperature, data: Jan 5, Feb 7, Mar 10, Apr 15"</li>
                <li>"Show a scatter plot of height vs weight, data: Height 170 180 160, Weight 65 75 55"</li>
                <li>Or just upload your Excel/CSV and say: "Bar chart of sales by product"</li>
              </ul>
            </div>
            {aiLoading && <p className="text-sm text-blue-600">Vizard is thinking...</p>}
            {aiError && <p className="text-sm text-red-600">{aiError}</p>}
            {chartConfig && (
              <div className="my-4">
                <h3 className="font-semibold mb-2">Your Chart</h3>
                <div className="flex gap-2 mb-2">
                  <Button variant="outline" size="sm" onClick={handleExportImage}>Download Image</Button>
                  <Button variant="outline" size="sm" onClick={handleExportPDF}>Download PDF</Button>
                  <Button variant="outline" size="sm" onClick={() => handleShareChart({ _id: chartHistory[0]?._id || '' })}>Share</Button>
                </div>
                <div ref={chartContainerRef} className="bg-white p-4 rounded shadow">
                  <ChartRenderer {...chartConfig} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-2">Shareable Chart Link</h2>
            <Input value={shareUrl} readOnly className="mb-2" />
            <div className="flex gap-2">
              <Button onClick={() => {navigator.clipboard.writeText(shareUrl);}}>Copy Link</Button>
              <Button variant="outline" onClick={() => setShowShareModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
