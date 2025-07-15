import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import jsPDF from 'jspdf';
import { useCallback } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  PieChart, 
  Upload,
  Target,
  Download,
  Share2,
  Mail,
  Copy,
  ExternalLink,
  Plus,
  FileSpreadsheet,
  Brain,
  Clock,
  Search
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AnalyticsPage() {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const pieRef = useRef(null);
  const barRef = useRef(null);
  const pieInstanceRef = useRef(null);
  const barInstanceRef = useRef(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedKPI, setSelectedKPI] = useState(null);
  const trendsSectionRef = useRef(null);
  const [projects, setProjects] = useState([]);
  const [charts, setCharts] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', description: '', category: '' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [analyticsSummary, setAnalyticsSummary] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

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
      fetchData(); // Refresh data
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create project or upload file');
    } finally {
      setUploading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    try {
      const [projRes, chartRes, uploadRes, actRes, summaryRes] = await Promise.all([
        fetch(`${API_URL}/projects`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/charts`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/excel/recent`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/activity`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/excel/analytics/summary`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (!projRes.ok || !chartRes.ok || !uploadRes.ok || !actRes.ok || !summaryRes.ok) throw new Error('Failed to fetch analytics data');
      setProjects(await projRes.json());
      setCharts(await chartRes.json());
      setUploads(await uploadRes.json());
      setActivities(await actRes.json());
      setAnalyticsSummary(await summaryRes.json());
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // KPI values
  const kpiData = [
    { 
      title: 'Total Projects Created', 
      value: projects.length || 0,
      icon: Target,
      change: '+12%',
      trend: 'up'
    },
    { 
      title: 'Charts Generated', 
      value: charts.length || 0,
      icon: BarChart3,
      change: '+8%',
      trend: 'up'
    },
    { 
      title: 'Files Uploaded', 
      value: uploads.length || 0,
      icon: Upload,
      change: '+15%',
      trend: 'up'
    },
    { 
      title: 'Hours Saved', 
      value: ((projects.length || 0) * 2 + (charts.length || 0)).toFixed(1),
      icon: Clock,
      change: '+5%',
      trend: 'up'
    },
  ];

  // Trends: group charts by week (simple frontend grouping)
  const trendsData = (() => {
    const weeks = {};
    charts.forEach(chart => {
      const d = new Date(chart.createdAt);
      const week = `${d.getFullYear()}-W${Math.ceil((d.getDate() + 6 - d.getDay()) / 7)}`;
      weeks[week] = (weeks[week] || 0) + 1;
    });
    const sortedWeeks = Object.keys(weeks).sort();
    return {
      labels: sortedWeeks,
      datasets: [
        {
          label: 'Charts Created',
          data: sortedWeeks.map(w => weeks[w]),
          borderColor: 'hsl(var(--primary))',
          backgroundColor: 'hsl(var(--primary) / 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  })();

  // Recent Activity: map activities to display format
  const recentActivity = activities.slice(0, 5).map(a => ({
    type: a.action?.charAt(0).toUpperCase() + a.action?.slice(1) || 'Activity',
    description: `${a.action || 'Action'} ${a.targetType || ''} ${a.targetId || ''}`.trim(),
    time: new Date(a.timestamp).toLocaleString(),
    icon: getActivityIcon(a.action)
  }));

  function getActivityIcon(action) {
    switch(action?.toLowerCase()) {
      case 'upload': return Upload;
      case 'chart': return BarChart3;
      case 'edit': return FileSpreadsheet;
      case 'share': return Share2;
      default: return Activity;
    }
  }

  // Data Insights
  // Chart Types
  const chartTypeCounts = charts.reduce((acc, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  }, {});
  const chartTypesData = {
    labels: Object.keys(chartTypeCounts),
    datasets: [
      {
        label: 'Chart Types',
        data: Object.values(chartTypeCounts),
        backgroundColor: [
          'hsl(var(--primary) / 0.8)',
          'hsl(var(--primary) / 0.6)',
          'hsl(var(--primary) / 0.4)',
          'hsl(var(--primary) / 0.2)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Project Categories
  const categoryCounts = projects.reduce((acc, p) => {
    if (p.category) acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
  const projectCategoriesData = {
    labels: Object.keys(categoryCounts),
    datasets: [
      {
        label: 'Projects',
        data: Object.values(categoryCounts),
        backgroundColor: 'hsl(var(--primary) / 0.2)',
        borderColor: 'hsl(var(--primary))',
        borderWidth: 1,
      },
    ],
  };
  
  // File type breakdown chart data
  const fileTypeChartData = analyticsSummary && analyticsSummary.fileTypeAgg ? {
    labels: analyticsSummary.fileTypeAgg.map(f => f._id),
    datasets: [{
      label: 'File Types',
      data: analyticsSummary.fileTypeAgg.map(f => f.count),
      backgroundColor: [
        'hsl(var(--primary) / 0.8)',
        'hsl(var(--primary) / 0.6)',
        'hsl(var(--primary) / 0.4)',
        'hsl(var(--primary) / 0.2)',
      ],
    }],
  } : null;

  // Uploads per week chart data
  const uploadTrendsData = analyticsSummary && analyticsSummary.weekAgg ? {
    labels: analyticsSummary.weekAgg.map(w => `Week ${w._id}`),
    datasets: [{
      label: 'Uploads',
      data: analyticsSummary.weekAgg.map(w => w.count),
      borderColor: 'hsl(var(--primary))',
      backgroundColor: 'hsl(var(--primary) / 0.1)',
      tension: 0.4,
      fill: true,
    }],
  } : null;

  // Uploads by project chart data
  const uploadsByProjectData = analyticsSummary && analyticsSummary.projectAgg ? {
    labels: analyticsSummary.projectAgg.map(p => p._id || 'No Project'),
    datasets: [{
      label: 'Uploads by Project',
      data: analyticsSummary.projectAgg.map(p => p.count),
      backgroundColor: 'hsl(var(--primary) / 0.2)',
      borderColor: 'hsl(var(--primary))',
      borderWidth: 1,
    }],
  } : null;

  const handleKpiClick = (idx) => {
    setSelectedKPI(idx);
    trendsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => setSelectedKPI(null), 1200);
  };

  // Helper: Gather analytics summary for export/share
  const getAnalyticsSummary = useCallback(() => {
    return {
      KPIs: kpiData,
      Trends: trendsData,
      RecentActivity: recentActivity,
      ChartTypes: chartTypesData,
      ProjectCategories: projectCategoriesData,
    };
  }, [kpiData, trendsData, recentActivity, chartTypesData, projectCategoriesData]);

  // Export as CSV
  const handleExportCSV = () => {
    const summary = getAnalyticsSummary();
    let csv = '';
    // KPIs
    csv += 'KPI,Value\n';
    summary.KPIs.forEach(kpi => {
      csv += `${kpi.title},${kpi.value}\n`;
    });
    csv += '\n';
    // Trends
    csv += 'Trends (Week,Charts Created)\n';
    summary.Trends.labels.forEach((label, idx) => {
      csv += `${label},${summary.Trends.datasets[0].data[idx]}\n`;
    });
    csv += '\n';
    // Recent Activity
    csv += 'Recent Activity (Type,Description,Time)\n';
    summary.RecentActivity.forEach(a => {
      csv += `${a.type},${a.description},${a.time}\n`;
    });
    csv += '\n';
    // Chart Types
    csv += 'Chart Types,Count\n';
    summary.ChartTypes.labels.forEach((label, idx) => {
      csv += `${label},${summary.ChartTypes.datasets[0].data[idx]}\n`;
    });
    csv += '\n';
    // Project Categories
    csv += 'Project Categories,Count\n';
    summary.ProjectCategories.labels.forEach((label, idx) => {
      csv += `${label},${summary.ProjectCategories.datasets[0].data[idx]}\n`;
    });
    csv += '\n';
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export as PDF
  const handleExportPDF = () => {
    const summary = getAnalyticsSummary();
    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(16);
    doc.text('Analytics Summary', 10, y);
    y += 10;
    doc.setFontSize(12);
    // KPIs
    doc.text('KPIs:', 10, y);
    y += 7;
    summary.KPIs.forEach(kpi => {
      doc.text(`${kpi.title}: ${kpi.value}`, 12, y);
      y += 6;
    });
    y += 4;
    // Trends
    doc.text('Trends (Charts Created Per Week):', 10, y);
    y += 7;
    summary.Trends.labels.forEach((label, idx) => {
      doc.text(`${label}: ${summary.Trends.datasets[0].data[idx]}`, 12, y);
      y += 6;
    });
    y += 4;
    // Recent Activity
    doc.text('Recent Activity:', 10, y);
    y += 7;
    summary.RecentActivity.forEach(a => {
      doc.text(`${a.type}: ${a.description} (${a.time})`, 12, y);
      y += 6;
    });
    y += 4;
    // Chart Types
    doc.text('Chart Types:', 10, y);
    y += 7;
    summary.ChartTypes.labels.forEach((label, idx) => {
      doc.text(`${label}: ${summary.ChartTypes.datasets[0].data[idx]}`, 12, y);
      y += 6;
    });
    y += 4;
    // Project Categories
    doc.text('Project Categories:', 10, y);
    y += 7;
    summary.ProjectCategories.labels.forEach((label, idx) => {
      doc.text(`${label}: ${summary.ProjectCategories.datasets[0].data[idx]}`, 12, y);
      y += 6;
    });
    doc.save('analytics.pdf');
  };

  // Share Analytics: Generate a shareable link (placeholder)
  const handleGenerateShareLink = () => {
    setShareLink(window.location.href + '?share=1');
  };

  // Share Analytics: Copy summary to clipboard
  const handleCopySummary = () => {
    const summary = getAnalyticsSummary();
    let text = 'Analytics Summary\n';
    summary.KPIs.forEach(kpi => { text += `${kpi.title}: ${kpi.value}\n`; });
    text += '\nTrends (Charts Created Per Week):\n';
    summary.Trends.labels.forEach((label, idx) => { text += `${label}: ${summary.Trends.datasets[0].data[idx]}\n`; });
    text += '\nRecent Activity:\n';
    summary.RecentActivity.forEach(a => { text += `${a.type}: ${a.description} (${a.time})\n`; });
    text += '\nChart Types:\n';
    summary.ChartTypes.labels.forEach((label, idx) => { text += `${label}: ${summary.ChartTypes.datasets[0].data[idx]}\n`; });
    text += '\nProject Categories:\n';
    summary.ProjectCategories.labels.forEach((label, idx) => { text += `${label}: ${summary.ProjectCategories.datasets[0].data[idx]}\n`; });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Share Analytics: Send via email (opens mail client)
  const handleShareEmail = () => {
    const summary = getAnalyticsSummary();
    let body = 'Analytics Summary%0D%0A';
    summary.KPIs.forEach(kpi => { body += `${kpi.title}: ${kpi.value}%0D%0A`; });
    body += '%0D%0ATrends (Charts Created Per Week):%0D%0A';
    summary.Trends.labels.forEach((label, idx) => { body += `${label}: ${summary.Trends.datasets[0].data[idx]}%0D%0A`; });
    body += '%0D%0ARecent Activity:%0D%0A';
    summary.RecentActivity.forEach(a => { body += `${a.type}: ${a.description} (${a.time})%0D%0A`; });
    body += '%0D%0AChart Types:%0D%0A';
    summary.ChartTypes.labels.forEach((label, idx) => { body += `${label}: ${summary.ChartTypes.datasets[0].data[idx]}%0D%0A`; });
    body += '%0D%0AProject Categories:%0D%0A';
    summary.ProjectCategories.labels.forEach((label, idx) => { body += `${label}: ${summary.ProjectCategories.datasets[0].data[idx]}%0D%0A`; });
    window.open(`mailto:?subject=My Analytics Summary&body=${body}`);
  };

  // AI Suggestions based on data
  const aiSuggestions = [
    {
      title: 'Performance Insight',
      message: `You've created ${charts.length} charts this month. Consider creating templates for frequently used chart types.`,
      icon: Brain
    },
    {
      title: 'Data Quality Tip',
      message: `${uploads.length} files uploaded. Review data quality to ensure accurate visualizations.`,
      icon: Target
    },
  ];

  // Filtered activities for search
  const filteredActivities = recentActivity.filter(activity =>
    activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted rounded-xl">
                <BarChart3 className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
                <p className="text-muted-foreground mt-1">Comprehensive insights and performance metrics</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-muted-foreground">Time Range:</label>
                <select
                  value={timeRange}
                  onChange={e => setTimeRange(e.target.value)}
                  className="border border-input rounded-lg px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="year">This Year</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <Button onClick={() => setShowModal(true)} className="flex items-center gap-2 shadow-sm">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-muted/50">
            <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Target className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2 data-[state=active]:bg-background">
              <PieChart className="h-4 w-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Download className="h-4 w-4" />
              Export
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {kpiData.every(item => !item.value) ? (
                <div className="col-span-4 text-center text-muted-foreground py-12">
                  <Target className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">No data available yet</p>
                  <p className="text-sm">Start creating projects to see your analytics</p>
                </div>
              ) : (
                kpiData.map((item, idx) => (
                  <Card
                    key={idx}
                    onClick={() => handleKpiClick(idx)}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 ${selectedKPI === idx ? 'ring-2 ring-primary border-primary/50' : 'border-border hover:border-primary/30'}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                          <p className="text-3xl font-bold tracking-tight">{item.value}</p>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-primary" />
                            <span className="text-xs text-primary font-medium">{item.change}</span>
                          </div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-xl">
                          {React.createElement(item.icon, { className: "h-8 w-8 text-primary" })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Trends Chart */}
            <Card ref={trendsSectionRef} className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trendsData.labels.length === 0 ? (
                  <div className="text-center text-muted-foreground py-16">
                    <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">No trend data available</p>
                    <p className="text-sm">Create some charts to see performance trends</p>
                  </div>
                ) : (
                  <div className="h-80 bg-muted/20 rounded-xl flex items-center justify-center p-4">
                    <canvas ref={chartRef}></canvas>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Suggestions */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <Brain className="h-6 w-6 text-primary" />
                  AI-Powered Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {aiSuggestions.map((suggestion, idx) => (
                    <div key={idx} className="p-6 rounded-xl border bg-muted/20 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-background rounded-lg">
                          <suggestion.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold text-sm">{suggestion.title}</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{suggestion.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-primary" />
                    Chart Type Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {chartTypesData.labels.length === 0 ? (
                    <div className="text-center text-muted-foreground py-16">
                      <PieChart className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg">No chart data available</p>
                    </div>
                  ) : (
                    <div className="h-80 bg-muted/20 rounded-xl flex items-center justify-center p-4">
                      <canvas ref={pieRef}></canvas>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Project Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {projectCategoriesData.labels.length === 0 ? (
                    <div className="text-center text-muted-foreground py-16">
                      <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg">No project data available</p>
                    </div>
                  ) : (
                    <div className="h-80 bg-muted/20 rounded-xl flex items-center justify-center p-4">
                      <canvas ref={barRef}></canvas>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* File Analytics */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                    File Type Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!fileTypeChartData ? (
                    <div className="text-center text-muted-foreground py-16">
                      <FileSpreadsheet className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg">No file data available</p>
                    </div>
                  ) : (
                    <div className="h-80 bg-muted/20 rounded-xl flex items-center justify-center p-4">
                      <canvas id="fileTypeChart"></canvas>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    Upload Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!uploadTrendsData ? (
                    <div className="text-center text-muted-foreground py-16">
                      <Upload className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg">No upload data available</p>
                    </div>
                  ) : (
                    <div className="h-80 bg-muted/20 rounded-xl flex items-center justify-center p-4">
                      <canvas id="uploadTrendsChart"></canvas>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-8">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <Activity className="h-6 w-6 text-primary" />
                    Recent Activity
                  </CardTitle>
                  <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-1">
                    <Search className="h-4 w-4 text-muted-foreground ml-3" />
                    <Input
                      placeholder="Search activities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64 border-0 bg-transparent focus:ring-0"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredActivities.length === 0 ? (
                    <div className="text-center text-muted-foreground py-16">
                      <Activity className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg">No recent activity found</p>
                      <p className="text-sm">Activities will appear here as you use the platform</p>
                    </div>
                  ) : (
                    filteredActivities.map((activity, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border bg-card/50 hover:bg-card transition-colors">
                         <div className="p-3 rounded-xl bg-muted">
                           {React.createElement(activity.icon, { className: "h-5 w-5 text-primary" })}
                         </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="text-xs font-medium">{activity.type}</Badge>
                            <span className="text-sm font-medium">{activity.description}</span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-full">
                          <Clock className="h-3 w-3" />
                          {activity.time}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-8">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Download className="h-6 w-6 text-primary" />
                  Export Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <Button onClick={handleExportPDF} className="h-auto p-6 flex flex-col items-center gap-3 text-left">
                    <FileSpreadsheet className="h-8 w-8" />
                    <div className="space-y-1">
                      <span className="font-semibold">Export as PDF</span>
                      <p className="text-xs opacity-70">Detailed report with all charts and data</p>
                    </div>
                  </Button>
                  <Button onClick={handleExportCSV} variant="outline" className="h-auto p-6 flex flex-col items-center gap-3 text-left">
                    <Download className="h-8 w-8" />
                    <div className="space-y-1">
                      <span className="font-semibold">Export as CSV</span>
                      <p className="text-xs opacity-70">Raw data for further analysis</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Share2 className="h-6 w-6 text-primary" />
                  Share Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <Button onClick={() => setShowShareModal(true)} variant="outline" className="h-auto p-6 flex flex-col items-center gap-3 text-left">
                    <ExternalLink className="h-8 w-8" />
                    <div className="space-y-1">
                      <span className="font-semibold">Generate Link</span>
                      <p className="text-xs opacity-70">Create shareable URL for team access</p>
                    </div>
                  </Button>
                  <Button onClick={handleCopySummary} variant="outline" className="h-auto p-6 flex flex-col items-center gap-3 text-left">
                    <Copy className="h-8 w-8" />
                    <div className="space-y-1">
                      <span className="font-semibold">Copy Summary</span>
                      <p className="text-xs opacity-70">Copy formatted text to clipboard</p>
                    </div>
                  </Button>
                  <Button onClick={handleShareEmail} variant="outline" className="h-auto p-6 flex flex-col items-center gap-3 text-left">
                    <Mail className="h-8 w-8" />
                    <div className="space-y-1">
                      <span className="font-semibold">Email Report</span>
                      <p className="text-xs opacity-70">Send summary via email client</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Project Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Project & Upload Data</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateAndUpload}>
            <Input name="name" placeholder="Project Name" value={projectForm.name} onChange={handleProjectFormChange} required />
            <Input name="description" placeholder="Description" value={projectForm.description} onChange={handleProjectFormChange} />
            <Input name="category" placeholder="Category" value={projectForm.category} onChange={handleProjectFormChange} />
            <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} required />
            {errorMsg && <div className="text-destructive text-sm p-3 bg-destructive/10 rounded-lg">{errorMsg}</div>}
            {successMsg && <div className="text-primary text-sm p-3 bg-primary/10 rounded-lg">{successMsg}</div>}
          </form>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreateAndUpload} disabled={uploading}>
              {uploading ? 'Creating...' : 'Create & Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Analytics</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button onClick={handleGenerateShareLink} className="w-full">Generate Shareable Link</Button>
            {shareLink && (
              <div className="flex items-center gap-2">
                <Input value={shareLink} readOnly className="flex-1" />
                <Button size="sm" onClick={() => {navigator.clipboard.writeText(shareLink); setCopied(true); setTimeout(() => setCopied(false), 1500);}}>
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}