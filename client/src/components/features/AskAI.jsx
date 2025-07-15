import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChartRenderer } from "./dashboard/ChartRenderer";
import { 
  BrainCircuit, 
  Send, 
  BarChart3, 
  TrendingUp, 
  Search, 
  FileSpreadsheet, 
  Clock, 
  Star,
  Upload,
  Download,
  Share,
  FileImage,
  FileText,
  Zap,
  History,
  Copy,
  ExternalLink,
  Plus,
  Brain,
  Database
} from "lucide-react";
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useLocation, useNavigate } from 'react-router-dom';
import { DataTable } from "./DataTable";

// AI function to generate chart configurations
const askGeminiAI = async ({ prompt, data }) => {
  // Simulate AI processing
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Parse the prompt to determine chart type and extract data
  const promptLower = prompt.toLowerCase();
  let chartType = 'bar';
  let chartData = [];
  let xKey = 'Category';
  let yKey = 'Value';
  
  // Determine chart type from prompt
  if (promptLower.includes('pie') || promptLower.includes('doughnut')) {
    chartType = 'pie';
  } else if (promptLower.includes('line') || promptLower.includes('trend')) {
    chartType = 'line';
  } else if (promptLower.includes('scatter') || promptLower.includes('correlation')) {
    chartType = 'scatter';
  } else if (promptLower.includes('area')) {
    chartType = 'area';
  } else if (promptLower.includes('radar')) {
    chartType = 'radar';
  }
  
  // Extract data from prompt or use uploaded data
  if (data && data.length > 0) {
    // Use uploaded Excel/CSV data
    chartData = data;
    const keys = Object.keys(data[0] || {});
    if (keys.length >= 2) {
      xKey = keys[0];
      yKey = keys[1];
    }
  } else {
    // Extract data from prompt text
    const dataMatch = prompt.match(/data:\s*([^,]+(?:\s*,\s*[^,]+)*)/i);
    if (dataMatch) {
      const dataStr = dataMatch[1];
      const pairs = dataStr.split(',').map(pair => pair.trim());
      
      chartData = pairs.map(pair => {
        const parts = pair.split(/\s+/);
        if (parts.length >= 2) {
          const label = parts[0];
          const value = parseFloat(parts[1]) || 0;
          return { [xKey]: label, [yKey]: value };
        }
        return { [xKey]: pair, [yKey]: Math.floor(Math.random() * 100) + 50 };
      });
    } else {
      // Try to extract data from different formats
      const numberMatch = prompt.match(/(\d+)/g);
      if (numberMatch && numberMatch.length > 0) {
        chartData = numberMatch.map((num, index) => ({
          [xKey]: `Item ${index + 1}`,
          [yKey]: parseInt(num)
        }));
      } else {
        // Generate sample data based on prompt
        const sampleData = [
          { [xKey]: 'Q1', [yKey]: Math.floor(Math.random() * 100) + 50 },
          { [xKey]: 'Q2', [yKey]: Math.floor(Math.random() * 100) + 50 },
          { [xKey]: 'Q3', [yKey]: Math.floor(Math.random() * 100) + 50 },
          { [xKey]: 'Q4', [yKey]: Math.floor(Math.random() * 100) + 50 },
        ];
        chartData = sampleData;
      }
    }
  }
  
  // Generate chart configuration
  const chartConfig = {
    type: chartType,
    data: chartData,
    xKey: xKey,
    yKey: yKey,
    palette: ['#3777E0', '#43e', '#e43', '#3e4', '#e34', '#4e3']
  };
  
  return { chartConfig };
};

const saveChartHistory = async (data) => {
  const history = JSON.parse(localStorage.getItem('chartHistory') || '[]');
  const newEntry = { ...data, _id: Date.now().toString(), favorite: false, createdAt: new Date() };
  history.unshift(newEntry);
  localStorage.setItem('chartHistory', JSON.stringify(history.slice(0, 50))); // Keep last 50
  return newEntry;
};

const fetchChartHistory = async () => {
  return JSON.parse(localStorage.getItem('chartHistory') || '[]');
};

const toggleFavoriteChart = async (id) => {
  const history = JSON.parse(localStorage.getItem('chartHistory') || '[]');
  const updated = history.map(item => 
    item._id === id ? { ...item, favorite: !item.favorite } : item
  );
  localStorage.setItem('chartHistory', JSON.stringify(updated));
  return updated;
};

const generateShareLink = async (id) => {
  return { shareId: id };
};

const fetchSharedChart = async (shareId) => {
  const history = JSON.parse(localStorage.getItem('chartHistory') || '[]');
  const chart = history.find(item => item._id === shareId);
  if (chart) {
    return { prompt: chart.prompt, chartConfig: chart.chartConfig };
  }
  throw new Error('Chart not found');
};



const quickActions = [
  {
    title: "Create Visualization",
    description: "Generate charts from your data instantly",
    icon: BarChart3,
  },
  {
    title: "Analyze Trends", 
    description: "Identify patterns and insights in your data",
    icon: TrendingUp,
  },
  {
    title: "Data Insights",
    description: "Extract meaningful information automatically",
    icon: Search,
  },
  {
    title: "Generate Dashboard",
    description: "Create comprehensive reports and analytics",
    icon: FileSpreadsheet,
  },
];

const samplePrompts = [
  "Create a bar chart showing sales by region with data: North 100, South 200, East 150, West 120",
  "Generate a pie chart of monthly expenses with data: Rent 500, Food 200, Utilities 100, Other 50",
  "Show a line chart of temperature trends over time with data: Jan 5, Feb 7, Mar 10, Apr 15",
  "Create a scatter plot showing correlation between height and weight with data: Height 170 180 160, Weight 65 75 55"
];

export default function VizardPage() {
  const [message, setMessage] = useState("");
  const [excelData, setExcelData] = useState(null);
  const [chartConfig, setChartConfig] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [chartHistory, setChartHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const chartContainerRef = useRef();
  const [shareUrl, setShareUrl] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const loadHistory = async () => {
      setHistoryLoading(true);
      try {
        const history = await fetchChartHistory();
        setChartHistory(history);
      } catch (err) {
        // Handle error silently
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
        setActiveTab("create");
      }).catch(() => {
        setAiError('Failed to load shared chart.');
      });
    }
  }, [location.search]);

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result;
      if (result && typeof result !== 'string') {
        const data = new Uint8Array(result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);
        setExcelData(json);
      }
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
          // Handle error silently
        }
      } else {
        setAiError("AI did not return a valid chart config.");
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
    setActiveTab("create");
  };

  const handleToggleFavorite = async (entry, e) => {
    e.stopPropagation();
    try {
      await toggleFavoriteChart(entry._id);
      const history = await fetchChartHistory();
      setChartHistory(history);
    } catch (err) {
      // Handle error silently
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
      e.preventDefault();
      handleSendMessage();
    }
  };

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

  const handleSamplePrompt = (prompt) => {
    setMessage(prompt);
    setActiveTab("create");
  };

  const favoriteCharts = chartHistory.filter(chart => chart.favorite);
  const recentCharts = chartHistory.slice(0, 10);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BrainCircuit className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Vizard</h1>
                <p className="text-sm text-muted-foreground">AI-Powered Data Visualization</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                AI Assistant
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Favorites
            </TabsTrigger>
            <TabsTrigger value="examples" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Examples
            </TabsTrigger>
          </TabsList>

          {/* Create Tab */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Creation Panel */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5" />
                      Describe Your Visualization
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="E.g., Create a bar chart showing sales by region with North: 100, South: 200, East: 150, West: 120"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="min-h-24 resize-none"
                    />
                    
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="file" 
                        accept=".xlsx,.xls,.csv" 
                        onChange={handleFileInput} 
                        className="border-0 bg-transparent h-auto p-0 text-sm"
                      />
                      {excelData && (
                        <Badge variant="outline" className="ml-auto">
                          <Database className="h-3 w-3 mr-1" />
                          {excelData.length} rows loaded
                        </Badge>
                      )}
                    </div>

                    {/* Data Table Preview */}
                    {excelData && Array.isArray(excelData) && excelData.length > 0 && (
                      <div className="my-4">
                        {/* Only show first 10 rows for preview */}
                        <DataTable data={excelData.slice(0, 10)} />
                      </div>
                    )}

                    <Button 
                      onClick={handleSendMessage} 
                      disabled={!message.trim() || aiLoading}
                      className="w-full"
                      size="lg"
                    >
                      {aiLoading ? (
                        <>
                          <BrainCircuit className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Generate Chart
                        </>
                      )}
                    </Button>

                    {aiError && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm text-destructive">{aiError}</p>
                      </div>
                    )}

                    {aiLoading && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="animate-pulse">
                            <Brain className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-blue-900">Vizard is thinking...</p>
                            <p className="text-xs text-blue-700">Analyzing your data and generating the perfect visualization</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Generated Chart */}
                {chartConfig && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Your Generated Chart
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={handleExportImage}>
                            <FileImage className="h-4 w-4 mr-2" />
                            PNG
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleExportPDF}>
                            <FileText className="h-4 w-4 mr-2" />
                            PDF
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleShareChart({ _id: chartHistory[0]?._id || '' }, undefined)}>
                            <Share className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-2 text-blue-700 font-semibold flex items-center gap-2">
                        <BrainCircuit className="h-4 w-4" />
                        Vizard says:
                      </div>
                      <div ref={chartContainerRef} className="bg-card border rounded-lg p-6" style={{ minHeight: '400px' }}>
                        <ChartRenderer {...chartConfig} />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Quick Actions & Tips */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-start h-auto p-4 bg-card border border-border text-foreground hover:bg-muted transition-colors dark:bg-zinc-900 dark:text-white dark:border-zinc-800 dark:hover:bg-zinc-800"
                        onClick={() => handleSamplePrompt(samplePrompts[index])}
                      >
                        <div className="flex items-start gap-3">
                          <action.icon className="h-5 w-5 mt-0.5 text-muted-foreground dark:text-zinc-300" />
                          <div className="text-left">
                            <p className="font-medium text-sm text-foreground dark:text-white">{action.title}</p>
                            <p className="text-xs text-muted-foreground dark:text-zinc-400">{action.description}</p>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Pro Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        Be specific about chart type and data structure
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        Upload Excel/CSV files for complex datasets
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        Include axis labels and data ranges in your prompt
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        Save favorite charts for quick access later
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Charts ({chartHistory.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Loading history...</p>
                  </div>
                ) : chartHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No charts yet. Generate your first chart to see history here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentCharts.map((entry) => (
                      <Card 
                        key={entry._id} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleHistoryClick(entry)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate" title={entry.prompt}>
                                {entry.prompt}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(entry.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => handleToggleFavorite(entry, e)}
                              >
                                <Star className={`h-3 w-3 ${entry.favorite ? 'text-yellow-500 fill-yellow-400' : 'text-muted-foreground'}`} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => handleShareChart(entry, e)}
                              >
                                <Share className="h-3 w-3 text-muted-foreground" />
                              </Button>
                            </div>
                          </div>
                          <div className="h-16 bg-muted/20 rounded border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                            <BarChart3 className="h-6 w-6 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Favorite Charts ({favoriteCharts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {favoriteCharts.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No favorite charts yet. Star charts from your history to add them here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favoriteCharts.map((entry) => (
                      <Card 
                        key={entry._id} 
                        className="cursor-pointer hover:shadow-md transition-shadow border-yellow-200"
                        onClick={() => handleHistoryClick(entry)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate" title={entry.prompt}>
                                {entry.prompt}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(entry.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => handleToggleFavorite(entry, e)}
                              >
                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-400" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => handleShareChart(entry, e)}
                              >
                                <Share className="h-3 w-3 text-muted-foreground" />
                              </Button>
                            </div>
                          </div>
                          <div className="h-16 bg-yellow-50 rounded border-2 border-dashed border-yellow-200 flex items-center justify-center">
                            <BarChart3 className="h-6 w-6 text-yellow-600" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Examples Tab */}
          <TabsContent value="examples" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Example Prompts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {samplePrompts.map((prompt, index) => (
                    <Card 
                      key={index} 
                      className="cursor-pointer hover:shadow-md transition-shadow border-dashed"
                      onClick={() => handleSamplePrompt(prompt)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-muted rounded-lg">
                            {index === 0 && <BarChart3 className="h-4 w-4" />}
                            {index === 1 && <div className="h-4 w-4 rounded-full bg-primary"></div>}
                            {index === 2 && <TrendingUp className="h-4 w-4" />}
                            {index === 3 && <div className="grid grid-cols-2 gap-0.5 h-4 w-4">{Array(4).fill(0).map((_, i) => <div key={i} className="bg-primary rounded-sm"></div>)}</div>}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {index === 0 && 'Bar Chart'}
                            {index === 1 && 'Pie Chart'}
                            {index === 2 && 'Line Chart'}
                            {index === 3 && 'Scatter Plot'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{prompt}</p>
                        <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto">
                          Try this example →
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share className="h-5 w-5" />
                Share Your Chart
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Shareable Link</label>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly className="flex-1" />
                          <Button
                            variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                  }}
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.open(shareUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}