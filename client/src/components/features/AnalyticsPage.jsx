"use client"

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const kpiData = [
  { title: 'Total Projects Created', value: 12 },
  { title: 'Charts Generated', value: 34 },
  { title: 'Files Uploaded', value: 7 },
  { title: 'Hours Saved', value: 15 },
];

const trendsData = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  datasets: [
    {
      label: 'Charts Created',
      data: [2, 5, 3, 7],
      borderColor: 'rgba(59,130,246,1)',
      backgroundColor: 'rgba(59,130,246,0.2)',
      tension: 0.4,
      fill: true,
    },
  ],
};

const recentActivity = [
  { type: 'Upload', description: 'Uploaded "Q4_Sales.xlsx"', time: '2 hours ago' },
  { type: 'Chart', description: 'Created a Bar Chart for "Q4 Sales"', time: '1 hour ago' },
  { type: 'Edit', description: 'Edited project "Marketing ROI"', time: '45 minutes ago' },
  { type: 'Share', description: 'Shared "Customer Segmentation" with Sarah', time: '30 minutes ago' },
  { type: 'Chart', description: 'Created a Pie Chart for "Customer Segmentation"', time: '10 minutes ago' },
];

const chartTypesData = {
  labels: ['Bar', 'Line', 'Pie', 'Scatter'],
  datasets: [
    {
      label: 'Chart Types',
      data: [8, 5, 3, 2],
      backgroundColor: [
        'rgba(59,130,246,0.7)',
        'rgba(16,185,129,0.7)',
        'rgba(251,191,36,0.7)',
        'rgba(244,63,94,0.7)'
      ],
      borderWidth: 1,
    },
  ],
};

const projectCategoriesData = {
  labels: ['Sales', 'Marketing', 'Finance', 'Customer'],
  datasets: [
    {
      label: 'Projects',
      data: [4, 3, 2, 3],
      backgroundColor: 'rgba(59,130,246,0.5)',
      borderColor: 'rgba(59,130,246,1)',
      borderWidth: 1,
    },
  ],
};

const topCollaborators = [
  { name: 'Sarah Johnson', count: 5 },
  { name: 'Mike Chen', count: 3 },
  { name: 'Emily Davis', count: 2 },
];

const aiSuggestions = [
  {
    title: 'Suggested Next Steps',
    message: 'You haven’t created a chart this week. Try visualizing your latest data!'
  },
  {
    title: 'Data Quality Tips',
    message: 'Your last upload had missing values. Consider cleaning your data for better results.'
  },
  {
    title: 'Recommended Templates',
    message: 'Based on your activity, try the "Sales Dashboard" or "Trend Analysis" templates.'
  },
];

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      try {
        const [projRes, chartRes, uploadRes, actRes] = await Promise.all([
          fetch(`${API_URL}/projects`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/charts`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/excel/recent`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/activity`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (!projRes.ok || !chartRes.ok || !uploadRes.ok || !actRes.ok) throw new Error('Failed to fetch analytics data');
        setProjects(await projRes.json());
        setCharts(await chartRes.json());
        setUploads(await uploadRes.json());
        setActivities(await actRes.json());
      } catch (err) {
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // KPI values
  const kpiData = [
    { title: 'Total Projects Created', value: projects.length },
    { title: 'Charts Generated', value: charts.length },
    { title: 'Files Uploaded', value: uploads.length },
    { title: 'Hours Saved', value: (projects.length * 2 + charts.length).toFixed(1) }, // Example estimate
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
          borderColor: 'rgba(59,130,246,1)',
          backgroundColor: 'rgba(59,130,246,0.2)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  })();

  // Recent Activity: map activities to display format
  const recentActivity = activities.slice(0, 5).map(a => ({
    type: a.action.charAt(0).toUpperCase() + a.action.slice(1),
    description: `${a.action} ${a.targetType || ''} ${a.targetId || ''}`.trim(),
    time: new Date(a.timestamp).toLocaleString(),
  }));

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
          'rgba(59,130,246,0.7)',
          'rgba(16,185,129,0.7)',
          'rgba(251,191,36,0.7)',
          'rgba(244,63,94,0.7)',
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
        backgroundColor: 'rgba(59,130,246,0.5)',
        borderColor: 'rgba(59,130,246,1)',
        borderWidth: 1,
      },
    ],
  };
  // Top Collaborators
  const collaboratorCounts = {};
  projects.forEach(p => (p.collaborators || []).forEach(u => { collaboratorCounts[u] = (collaboratorCounts[u] || 0) + 1; }));
  const topCollaborators = Object.entries(collaboratorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id, count]) => ({ name: id, count })); // You may want to resolve user names

  const handleKpiClick = (idx) => {
    setSelectedKPI(idx);
    trendsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => setSelectedKPI(null), 1200); // Remove highlight after 1.2s
  };

  return (
    <div className="flex-1 space-y-8 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((item, idx) => (
          <Card
            key={idx}
            onClick={() => handleKpiClick(idx)}
            className={`cursor-pointer transition-shadow ${selectedKPI === idx ? 'ring-4 ring-blue-400' : ''}`}
          >
            <CardHeader>
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex items-center justify-end mb-2 mt-8">
        <label className="mr-2 font-medium">Time Range:</label>
        <select
          value={timeRange}
          onChange={e => setTimeRange(e.target.value)}
          className="border rounded px-2 py-1 bg-background dark:bg-muted"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="year">This Year</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      <div ref={trendsSectionRef} className="bg-white dark:bg-muted rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Trends: Charts Created Per Week</h2>
        <canvas ref={chartRef} height={300}></canvas>
      </div>
      <div className="bg-white dark:bg-muted rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity.map((activity, idx) => (
            <Card key={idx} className="border-l-4 border-blue-500">
              <CardContent className="flex items-center gap-4 py-4">
                <span className="font-semibold text-blue-600 w-20">{activity.type}</span>
                <span className="flex-1">{activity.description}</span>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div className="bg-white dark:bg-muted rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Data Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Most Used Chart Types</h3>
            <canvas ref={pieRef} height={220}></canvas>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Project Categories</h3>
            <canvas ref={barRef} height={220}></canvas>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Top Collaborators</h3>
            <ul className="space-y-2">
              {topCollaborators.map((collab, idx) => (
                <li key={idx} className="flex justify-between items-center bg-blue-50 dark:bg-blue-900 rounded px-3 py-2">
                  <span>{collab.name}</span>
                  <span className="font-bold text-blue-700 dark:text-blue-300">{collab.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-muted rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">AI-Powered Suggestions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {aiSuggestions.map((s, idx) => (
            <Card key={idx} className="border-l-4 border-green-500">
              <CardHeader>
                <CardTitle className="text-base font-semibold">{s.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{s.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div className="bg-white dark:bg-muted rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Export & Sharing</h2>
        <Card className="flex flex-col md:flex-row items-center gap-4 p-4 border-l-4 border-yellow-500">
          <Button onClick={() => alert('Export as PDF/CSV coming soon!')} className="w-full md:w-auto">
            Export Analytics
          </Button>
          <Button variant="outline" onClick={() => alert('Share insights coming soon!')} className="w-full md:w-auto">
            Share Insights
          </Button>
        </Card>
      </div>
    </div>
  );
}
